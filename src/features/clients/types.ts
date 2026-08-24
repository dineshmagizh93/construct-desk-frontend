export interface ClientContactLog {
  id: string
  note: string
  date: string
}

export interface Client {
  id: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  type: 'Individual' | 'Developer' | 'Government' | 'Corporate'
  createdAt: string
  contactHistory: ClientContactLog[]
}
