"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Building2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { companyApi, UpdateCompanyDto } from "@/lib/api/company"
import { useAuth } from "@/lib/hooks/use-auth"
import { ApiError } from "@/lib/api/client"
import { setCurrency, Currency, CURRENCY_NAMES } from "@/lib/utils/currency"
import { Select } from "@/components/ui/select"

interface CompanyProfileData {
  companyName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  taxId: string
  website: string
  currency: Currency
}

export function CompanyProfileForm() {
  const { user, checkAuth } = useAuth()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CompanyProfileData>({
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      taxId: "",
      website: "",
      currency: "USD",
    },
  })

  const selectedCurrency = watch("currency")

  // Load company data
  React.useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true)
        const company = await companyApi.getMe()
        reset({
          companyName: company.name || "",
          email: company.email || "",
          phone: company.phone || "",
          address: company.address || "",
          city: company.city || "",
          state: company.state || "",
          zipCode: company.zipCode || "",
          country: company.country || "",
          taxId: company.taxId || "",
          website: company.website || "",
          currency: (company.currency as Currency) || "USD",
        })
        // Store currency in localStorage for quick access
        if (company.currency) {
          setCurrency(company.currency as Currency)
        }
      } catch (err) {
        console.error("Failed to load company:", err)
        // If API fails, use user's company data from auth
        if (user?.company) {
          reset({
            companyName: user.company.name || "",
            email: user.company.email || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            taxId: "",
            website: "",
            currency: (user.company.currency as Currency) || "USD",
          })
          if (user.company.currency) {
            setCurrency(user.company.currency as Currency)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [user, reset])

  const onSubmit = async (data: CompanyProfileData) => {
    try {
      setIsSaving(true)
      setError(null)
      setIsSaved(false)

      const updateData: UpdateCompanyDto = {
        name: data.companyName,
        email: data.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
        country: data.country || undefined,
        taxId: data.taxId || undefined,
        website: data.website || undefined,
        currency: data.currency,
      }

      await companyApi.update(updateData)
      
      // Store currency in localStorage for quick access
      setCurrency(data.currency)
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)

      // Refresh auth to update company name in header
      await checkAuth()
      
      // Reload page to update all currency displays
      window.location.reload()
    } catch (err) {
      const apiError = err as ApiError
      const errorMessage = Array.isArray(apiError.message) ? apiError.message[0] : (apiError.message || "Failed to update company profile. Please try again.")
      setError(errorMessage)
      console.error("Error updating company:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Profile
        </CardTitle>
        <CardDescription>Manage your company information and details</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading company profile...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          {/* Company Name and Email */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                {...register("companyName", { required: "Company name is required" })}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                placeholder="contact@company.com"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone and Website */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                placeholder="https://www.company.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="Street address" />
          </div>

          {/* City, State, Zip */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="City" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} placeholder="State" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input id="zipCode" {...register("zipCode")} placeholder="Zip Code" />
            </div>
          </div>

          {/* Country and Tax ID */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} placeholder="Country" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" {...register("taxId")} placeholder="Tax Identification Number" />
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="currency">
              Currency <span className="text-destructive">*</span>
            </Label>
            <Select
              id="currency"
              value={selectedCurrency}
              onChange={(e) => setValue("currency", e.target.value as Currency)}
            >
              <option value="USD">{CURRENCY_NAMES.USD} (USD)</option>
              <option value="INR">{CURRENCY_NAMES.INR} (INR)</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              This currency will be used throughout the application for all monetary values.
            </p>
          </div>

          {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {isSaved && <span className="text-green-600 dark:text-green-400">Changes saved successfully!</span>}
              </p>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

