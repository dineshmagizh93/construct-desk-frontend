import type { Payment } from './types'

export const PAYMENTS_SEED: Payment[] = [
  { id: 'pay-1', invoiceNumber: 'INV-2026-014', clientName: 'Greenfield Developers', projectId: 'PRJ-0001', amount: 4500000, dueDate: '2026-07-01', status: 'paid' },
  { id: 'pay-2', invoiceNumber: 'INV-2026-015', clientName: 'Vikram Singh', projectId: 'PRJ-0002', amount: 1200000, dueDate: '2026-07-10', status: 'unpaid' },
  { id: 'pay-3', invoiceNumber: 'INV-2026-011', clientName: 'Precision Auto Components', projectId: 'PRJ-0006', amount: 3800000, dueDate: '2026-06-20', status: 'overdue' },
  { id: 'pay-4', invoiceNumber: 'INV-2026-016', clientName: 'Skyline Infra Ltd', projectId: 'PRJ-0003', amount: 2000000, dueDate: '2026-07-15', status: 'unpaid' },
  { id: 'pay-5', invoiceNumber: 'INV-2026-009', clientName: 'State PWD Department', projectId: 'PRJ-0005', amount: 6000000, dueDate: '2026-04-05', status: 'paid' },
  { id: 'pay-6', invoiceNumber: 'INV-2026-017', clientName: 'State PWD Department', projectId: 'PRJ-0010', amount: 12000000, dueDate: '2026-07-20', status: 'unpaid' },
  { id: 'pay-7', invoiceNumber: 'INV-2026-018', clientName: 'Precision Auto Components', projectId: 'PRJ-0008', amount: 5400000, dueDate: '2026-07-05', status: 'overdue' },
  { id: 'pay-8', invoiceNumber: 'INV-2026-019', clientName: 'Skyline Infra Ltd', projectId: 'PRJ-0011', amount: 8000000, dueDate: '2026-07-25', status: 'unpaid' },
  { id: 'pay-9', invoiceNumber: 'INV-2026-020', clientName: 'Vikram Singh', projectId: 'PRJ-0012', amount: 3200000, dueDate: '2026-07-08', status: 'paid' },
  { id: 'pay-10', invoiceNumber: 'INV-2026-021', clientName: 'Skyline Infra Ltd', projectId: 'PRJ-0013', amount: 2100000, dueDate: '2026-06-25', status: 'paid' },
  { id: 'pay-11', invoiceNumber: 'INV-2026-022', clientName: 'Greenfield Developers', projectId: 'PRJ-0016', amount: 5600000, dueDate: '2026-07-12', status: 'unpaid' },
  { id: 'pay-12', invoiceNumber: 'INV-2026-006', clientName: 'Greenfield Developers', projectId: 'PRJ-0009', amount: 2800000, dueDate: '2026-01-15', status: 'paid' },
  { id: 'pay-13', invoiceNumber: 'INV-2026-023', clientName: 'Precision Auto Components', projectId: 'PRJ-0015', amount: 1900000, dueDate: '2026-02-20', status: 'paid' },
  { id: 'pay-14', invoiceNumber: 'INV-2026-024', clientName: 'State PWD Department', projectId: 'PRJ-0014', amount: 4000000, dueDate: '2026-07-30', status: 'unpaid' },
  { id: 'pay-15', invoiceNumber: 'INV-2026-025', clientName: 'Vikram Singh', projectId: 'PRJ-0007', amount: 1500000, dueDate: '2026-06-28', status: 'overdue' },
  { id: 'pay-16', invoiceNumber: 'INV-2026-026', clientName: 'Precision Auto Components', projectId: 'PRJ-0006', amount: 3200000, dueDate: '2026-06-30', status: 'paid' },
  { id: 'pay-17', invoiceNumber: 'INV-2026-027', clientName: 'Skyline Infra Ltd', projectId: 'PRJ-0003', amount: 1800000, dueDate: '2026-08-01', status: 'unpaid' },
  { id: 'pay-18', invoiceNumber: 'INV-2026-028', clientName: 'Greenfield Developers', projectId: 'PRJ-0001', amount: 6100000, dueDate: '2026-07-18', status: 'unpaid' },
  { id: 'pay-19', invoiceNumber: 'INV-2026-029', clientName: 'Vikram Singh', projectId: 'PRJ-0002', amount: 950000, dueDate: '2026-06-15', status: 'overdue' },
  { id: 'pay-20', invoiceNumber: 'INV-2026-030', clientName: 'State PWD Department', projectId: 'PRJ-0005', amount: 2500000, dueDate: '2026-04-20', status: 'paid' },
]
