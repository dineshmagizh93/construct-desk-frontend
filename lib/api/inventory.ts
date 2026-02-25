import { apiClient } from './client';

export enum InventoryCategory {
  MATERIAL = 'Material',
  TOOL = 'Tool',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minStock: number;
  unitPrice?: number;
  vendorId?: string;
  location?: string;
  sku?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  projectId?: string;
  reference?: string;
  notes?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  categoryCounts: Record<string, number>;
}

export interface CreateInventoryItemDto {
  name: string;
  description?: string;
  category: InventoryCategory;
  unit: string;
  currentStock?: number;
  minStock?: number;
  unitPrice?: number;
  vendorId?: string;
  location?: string;
  sku?: string;
  notes?: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  category?: InventoryCategory;
  unit?: string;
  currentStock?: number;
  minStock?: number;
  unitPrice?: number;
  vendorId?: string;
  location?: string;
  sku?: string;
  notes?: string;
}

export interface CreateInventoryTransactionDto {
  itemId: string;
  type: TransactionType;
  quantity: number;
  projectId?: string;
  reference?: string;
  notes?: string;
  transactionDate?: string;
}

// Transform backend response to frontend types
const transformItem = (data: any): InventoryItem => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category: data.category as InventoryCategory,
    unit: data.unit,
    currentStock: data.currentStock ? parseFloat(data.currentStock.toString()) : 0,
    minStock: data.minStock ? parseFloat(data.minStock.toString()) : 0,
    unitPrice: data.unitPrice ? parseFloat(data.unitPrice.toString()) : undefined,
    vendorId: data.vendorId,
    location: data.location,
    sku: data.sku,
    notes: data.notes,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    transactions: data.transactions?.map(transformTransaction),
  };
};

const transformTransaction = (data: any): InventoryTransaction => {
  return {
    id: data.id,
    itemId: data.itemId,
    type: data.type as TransactionType,
    quantity: data.quantity ? parseFloat(data.quantity.toString()) : 0,
    projectId: data.projectId,
    reference: data.reference,
    notes: data.notes,
    transactionDate: data.transactionDate,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    item: data.item,
  };
};

export const inventoryApi = {
  // Items
  async getAllItems(category?: string): Promise<InventoryItem[]> {
    const params = category ? `?category=${category}` : '';
    const data = await apiClient.get<any[]>(`/inventory/items${params}`);
    return data.map(transformItem);
  },

  async getItemById(id: string): Promise<InventoryItem> {
    const data = await apiClient.get<any>(`/inventory/items/${id}`);
    return transformItem(data);
  },

  async createItem(item: CreateInventoryItemDto): Promise<InventoryItem> {
    const data = await apiClient.post<any>('/inventory/items', item);
    return transformItem(data);
  },

  async updateItem(id: string, item: UpdateInventoryItemDto): Promise<InventoryItem> {
    const data = await apiClient.patch<any>(`/inventory/items/${id}`, item);
    return transformItem(data);
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/inventory/items/${id}`);
  },

  async getLowStockItems(): Promise<InventoryItem[]> {
    const data = await apiClient.get<any[]>('/inventory/items/low-stock');
    return data.map(transformItem);
  },

  // Transactions
  async getAllTransactions(itemId?: string): Promise<InventoryTransaction[]> {
    const params = itemId ? `?itemId=${itemId}` : '';
    const data = await apiClient.get<any[]>(`/inventory/transactions${params}`);
    return data.map(transformTransaction);
  },

  async getTransactionById(id: string): Promise<InventoryTransaction> {
    const data = await apiClient.get<any>(`/inventory/transactions/${id}`);
    return transformTransaction(data);
  },

  async createTransaction(transaction: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    const data = await apiClient.post<any>('/inventory/transactions', transaction);
    return transformTransaction(data);
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/inventory/transactions/${id}`);
  },

  // Stats
  async getStats(): Promise<InventoryStats> {
    return apiClient.get<InventoryStats>('/inventory/stats');
  },
};

