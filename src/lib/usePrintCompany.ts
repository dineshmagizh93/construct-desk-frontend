import { useAuthStore } from '@/features/auth/store'
import type { PrintCompany } from './printDocument'

/** The signed-in company's own letterhead details (name, address, phone, email, GSTIN, logo). */
export function usePrintCompany(): PrintCompany {
  const company = useAuthStore((s) => s.company)
  return {
    name: company?.name ?? '',
    address: company?.address,
    phone: company?.phone,
    email: company?.email,
    gstNumber: company?.gstNumber,
    logoUrl: company?.logoUrl,
  }
}
