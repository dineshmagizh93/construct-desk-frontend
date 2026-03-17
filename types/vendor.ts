export type VendorType =
  | "Material Supplier"
  | "Contractor"
  | "Electrician"
  | "Plumber"
  | "Transport"
  | "Equipment Rental"
  | "Other"

export type VendorStatus = "Active" | "Inactive"

export interface Vendor {
  id: string
  name: string
  type: VendorType
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  notes?: string
  status: VendorStatus
  createdAt: string
  updatedAt: string
}

export interface VendorFormData {
  name: string
  type: VendorType
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  notes?: string
  status: VendorStatus
}

