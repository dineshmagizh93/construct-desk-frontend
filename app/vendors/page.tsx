"use client"

import { VendorList } from "@/components/vendors/vendor-list"
import { useVendors } from "@/lib/hooks/use-vendors"
import { VendorFormSchema } from "@/lib/validations/vendor"
import { Vendor } from "@/types/vendor"

export default function VendorsPage() {
  const { createVendor, loadVendors } = useVendors()

  const handleCreateVendor = async (data: VendorFormSchema) => {
    try {
      // Create vendor - this updates the hook state immediately
      await createVendor({
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        notes: data.notes || undefined,
      } as Omit<Vendor, "id" | "createdAt" | "updatedAt">)
      // Immediately refresh to ensure VendorList component sees the update
      await loadVendors()
    } catch (error) {
      throw error // Re-throw to let the form handle the error
    }
  }

  return <VendorList onCreateVendor={() => {}} />
}

