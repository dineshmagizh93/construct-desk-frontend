import type { InventoryItem } from './types'

export const INVENTORY_SEED: InventoryItem[] = [
  { id: 'inv-1', name: 'Cement (OPC 53 Grade)', category: 'Cement', unit: 'bags', quantity: 120, reorderLevel: 200, unitCost: 380, projectId: 'PRJ-0002' },
  { id: 'inv-2', name: 'TMT Steel Bars (12mm)', category: 'Steel', unit: 'tons', quantity: 18, reorderLevel: 10, unitCost: 62000, projectId: 'PRJ-0001' },
  { id: 'inv-3', name: 'River Sand', category: 'Aggregates', unit: 'cu.m', quantity: 65, reorderLevel: 30, unitCost: 1800, projectId: 'PRJ-0001' },
  { id: 'inv-4', name: 'Red Clay Bricks', category: 'Masonry', unit: 'pieces', quantity: 24000, reorderLevel: 10000, unitCost: 8, projectId: 'PRJ-0002' },
  { id: 'inv-5', name: 'PVC Conduit Pipes (25mm)', category: 'Electrical', unit: 'meters', quantity: 850, reorderLevel: 500, unitCost: 22, projectId: 'PRJ-0006' },
  { id: 'inv-6', name: 'Ready-mix Concrete M25', category: 'Concrete', unit: 'cu.m', quantity: 12, reorderLevel: 25, unitCost: 6200, projectId: 'PRJ-0001' },
  { id: 'inv-7', name: 'TMT Steel Bars (16mm)', category: 'Steel', unit: 'tons', quantity: 22, reorderLevel: 10, unitCost: 61500, projectId: 'PRJ-0010' },
  { id: 'inv-8', name: 'Fly Ash Bricks', category: 'Masonry', unit: 'pieces', quantity: 18000, reorderLevel: 8000, unitCost: 9, projectId: 'PRJ-0012' },
  { id: 'inv-9', name: 'PEB Roof Sheets', category: 'Steel', unit: 'sq.m', quantity: 3200, reorderLevel: 1000, unitCost: 450, projectId: 'PRJ-0006' },
  { id: 'inv-10', name: 'Copper Electrical Cable (4mm)', category: 'Electrical', unit: 'meters', quantity: 1400, reorderLevel: 600, unitCost: 65, projectId: 'PRJ-0011' },
  { id: 'inv-11', name: 'Ceramic Floor Tiles', category: 'Finishing Materials', unit: 'sq.m', quantity: 900, reorderLevel: 400, unitCost: 320, projectId: 'PRJ-0013' },
  { id: 'inv-12', name: 'Waterproofing Membrane', category: 'Waterproofing', unit: 'rolls', quantity: 45, reorderLevel: 20, unitCost: 2800, projectId: 'PRJ-0002' },
  { id: 'inv-13', name: 'Aluminium Window Frames', category: 'Glazing', unit: 'pieces', quantity: 120, reorderLevel: 50, unitCost: 4200, projectId: 'PRJ-0016' },
  { id: 'inv-14', name: 'M-Sand', category: 'Aggregates', unit: 'cu.m', quantity: 8, reorderLevel: 20, unitCost: 1650, projectId: 'PRJ-0008' },
  { id: 'inv-15', name: 'Emulsion Paint', category: 'Paints & Coatings', unit: 'litres', quantity: 620, reorderLevel: 300, unitCost: 210, projectId: 'PRJ-0009' },
  { id: 'inv-16', name: 'PVC Conduit Pipes (32mm)', category: 'Electrical', unit: 'meters', quantity: 300, reorderLevel: 400, unitCost: 28, projectId: 'PRJ-0003' },
  { id: 'inv-17', name: 'Precast Girders', category: 'Steel', unit: 'pieces', quantity: 6, reorderLevel: 4, unitCost: 1850000, projectId: 'PRJ-0010' },
  { id: 'inv-18', name: 'Granite Slabs', category: 'Finishing Materials', unit: 'sq.m', quantity: 240, reorderLevel: 100, unitCost: 1450, projectId: 'PRJ-0016' },
  { id: 'inv-19', name: 'Scaffolding Pipes', category: 'Scaffolding', unit: 'pieces', quantity: 850, reorderLevel: 300, unitCost: 620, projectId: 'PRJ-0011' },
  { id: 'inv-20', name: 'Bitumen (VG-30)', category: 'Roads & Paving', unit: 'drums', quantity: 35, reorderLevel: 15, unitCost: 9200, projectId: 'PRJ-0014' },
]
