export interface Vendor {
  id: string
  name: string
  category: string
  contactPerson: string
  phone: string
  email: string
  rating: number
  status: 'active' | 'inactive'
}
