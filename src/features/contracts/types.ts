export type ContractType = 'Contract' | 'Purchase Order'
export type ContractStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface Contract {
  id: string
  title: string
  type: ContractType
  party: string
  projectId: string
  amount: number
  status: ContractStatus
  signedDate: string
}
