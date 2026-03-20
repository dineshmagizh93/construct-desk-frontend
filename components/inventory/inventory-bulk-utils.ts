import { InventoryCategory } from '@/lib/api/inventory'
import { parseCsv, normalizeHeaderKey } from '@/lib/utils/csv'

export const INVENTORY_ITEM_BULK_HEADERS = [
  'Name',
  'Category',
  'Unit',
  'Description',
  'Current Stock',
  'Min Stock',
  'Unit Price',
  'Location',
  'SKU',
  'Vendor ID',
  'Notes'
]

export const generateInventoryItemCsvTemplate = (): string => {
  return INVENTORY_ITEM_BULK_HEADERS.join(',') + '\n'
}

export const INVENTORY_TRANSACTION_BULK_HEADERS = [
  'Item Name',
  'Project ID',
  'Project Name',
  'Type',
  'Quantity',
  'Reference',
  'Transaction Date',
  'Notes'
]

export const generateInventoryTransactionCsvTemplate = (): string => {
  return INVENTORY_TRANSACTION_BULK_HEADERS.join(',') + '\n'
}

export const parseBulkInventoryItemsFromCsv = (text: string) => {
  const rows = parseCsv(text)
  if (rows.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.')
  }

  const headers = rows[0].map(normalizeHeaderKey)

  const requiredMap = { name: false, category: false, unit: false }
  headers.forEach(h => {
    if (h === 'name') requiredMap.name = true
    if (h === 'category') requiredMap.category = true
    if (h === 'unit') requiredMap.unit = true
  })

  if (!requiredMap.name || !requiredMap.category || !requiredMap.unit) {
    throw new Error('CSV is missing required headers: Name, Category, Unit')
  }

  const nameIdx = headers.indexOf('name')
  const categoryIdx = headers.indexOf('category')
  const unitIdx = headers.indexOf('unit')
  const descIdx = headers.indexOf('description')
  const curStockIdx = headers.indexOf('currentstock')
  const minStockIdx = headers.indexOf('minstock')
  const priceIdx = headers.indexOf('unitprice')
  const locIdx = headers.indexOf('location')
  const skuIdx = headers.indexOf('sku')
  const vendorIdx = headers.indexOf('vendorid')
  const notesIdx = headers.indexOf('notes')

  const parsedItems = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.every(cell => !cell)) continue

    const name = row[nameIdx]?.trim() || ''
    const categoryRaw = row[categoryIdx]?.trim() || ''
    const unit = row[unitIdx]?.trim() || ''

    if (!name || !categoryRaw || !unit) {
      throw new Error(`Row ${i + 1}: Name, Category, and Unit are required fields.`)
    }

    const mapCategory = (input: string): InventoryCategory => {
      const c = input.toLowerCase()
      if (c.includes('material')) return InventoryCategory.MATERIAL
      if (c.includes('tool')) return InventoryCategory.TOOL
      if (c.includes('equip')) return InventoryCategory.EQUIPMENT
      return InventoryCategory.OTHER
    }

    const currentStock = curStockIdx >= 0 ? parseFloat(row[curStockIdx] || '0') : 0
    const minStock = minStockIdx >= 0 ? parseFloat(row[minStockIdx] || '0') : 0
    const unitPrice = priceIdx >= 0 && row[priceIdx] ? parseFloat(row[priceIdx]) : undefined

    parsedItems.push({
      name,
      description: descIdx >= 0 ? row[descIdx]?.trim() || undefined : undefined,
      category: mapCategory(categoryRaw),
      unit,
      currentStock: isNaN(currentStock) ? 0 : currentStock,
      minStock: isNaN(minStock) ? 0 : minStock,
      unitPrice: isNaN(unitPrice as number) ? undefined : unitPrice,
      vendorId: vendorIdx >= 0 ? row[vendorIdx]?.trim() || undefined : undefined,
      location: locIdx >= 0 ? row[locIdx]?.trim() || undefined : undefined,
      sku: skuIdx >= 0 ? row[skuIdx]?.trim() || undefined : undefined,
      notes: notesIdx >= 0 ? row[notesIdx]?.trim() || undefined : undefined
    })
  }

  return parsedItems
}

export const parseBulkInventoryTransactionsFromCsv = (text: string) => {
  const rows = parseCsv(text)
  if (rows.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row.')
  }

  const headers = rows[0].map(normalizeHeaderKey)

  const requiredMap = { itemname: false, type: false, quantity: false }
  headers.forEach(h => {
    if (h === 'itemname') requiredMap.itemname = true
    if (h === 'type') requiredMap.type = true
    if (h === 'quantity') requiredMap.quantity = true
  })

  if (!requiredMap.itemname || !requiredMap.type || !requiredMap.quantity) {
    throw new Error('CSV is missing required headers: Item Name, Type, Quantity')
  }

  const itemIdx = headers.indexOf('itemname')
  const pidIdx = headers.indexOf('projectid')
  const pnameIdx = headers.indexOf('projectname')
  const typeIdx = headers.indexOf('type')
  const qtyIdx = headers.indexOf('quantity')
  const refIdx = headers.indexOf('reference')
  const dateIdx = headers.indexOf('transactiondate')
  const notesIdx = headers.indexOf('notes')

  const parsedTransactions = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row.every(cell => !cell)) continue

    const itemName = row[itemIdx]?.trim() || ''
    const rawType = row[typeIdx]?.trim() || ''
    const qtyRaw = row[qtyIdx]?.trim() || ''

    if (!itemName || !rawType || !qtyRaw) {
      throw new Error(`Row ${i + 1}: Item Name, Type, and Quantity are required fields.`)
    }

    const mapType = (input: string) => {
      const t = input.toLowerCase()
      if (t.includes('out')) return 'OUT'
      if (t.includes('adj')) return 'ADJUSTMENT'
      return 'IN'
    }

    const quantity = parseFloat(qtyRaw)
    if (isNaN(quantity)) {
      throw new Error(`Row ${i + 1}: Quantity must be a valid number.`)
    }

    const dateStr = dateIdx >= 0 ? row[dateIdx]?.trim() : ''
    const transactionDate = dateStr ? new Date(dateStr) : undefined

    parsedTransactions.push({
      itemName,
      type: mapType(rawType),
      quantity,
      projectId: pidIdx >= 0 ? row[pidIdx]?.trim() || undefined : undefined,
      projectName: pnameIdx >= 0 ? row[pnameIdx]?.trim() || undefined : undefined,
      reference: refIdx >= 0 ? row[refIdx]?.trim() || undefined : undefined,
      transactionDate: transactionDate && !isNaN(transactionDate.getTime()) ? transactionDate.toISOString() : undefined,
      notes: notesIdx >= 0 ? row[notesIdx]?.trim() || undefined : undefined
    })
  }

  return parsedTransactions
}
