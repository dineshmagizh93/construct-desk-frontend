"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Building2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/use-auth"
import { ApiError } from "@/lib/api/client"
import { companyApi, UpdateCompanyDto } from "@/lib/api/company"
import { setCurrency, Currency, CURRENCY_NAMES } from "@/lib/utils/currency"
import { Select } from "@/components/ui/select"
import { CountrySelector, StateSelector } from "@/components/ui/country-state-selector"
import { Controller } from "react-hook-form"

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
    control,
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
  const selectedCountry = watch("country")

  // Load company data
  React.useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true)
        const data = await fetch('/api/company').then(res => res.json())
        reset({
          companyName: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zipCode: data.zipCode || "",
          country: data.country || "",
          taxId: data.taxId || "",
          website: data.website || "",
          currency: (data.currency as Currency) || "USD",
        })
        // Store currency in localStorage for quick access
        if (data.currency) {
          setCurrency(data.currency as Currency)
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
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-4 px-0">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building2 className="h-6 w-6 text-primary" />
          Company Profile
        </CardTitle>
        <CardDescription className="text-base">Manage your company information, location, and regional preferences</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading company profile...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="pb-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 mb-4 text-sm text-destructive border border-destructive/20 flex items-center">
                {error}
              </div>
            )}
            
            {/* 3-Column Main Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
              
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="companyName" {...register("companyName", { required: "Company name is required" })} placeholder="Enter company name" className="h-9" />
                  {errors.companyName && <p className="text-sm text-destructive font-medium">{errors.companyName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" type="email" {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }})} placeholder="contact@company.com" className="h-9" />
                  {errors.email && <p className="text-sm text-destructive font-medium">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-medium">Phone Number</Label>
                  <Input id="phone" type="tel" {...register("phone")} placeholder="+1 (555) 123-4567" className="h-9" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="font-medium">Website</Label>
                  <Input id="website" type="url" {...register("website")} placeholder="https://www.company.com" className="h-9" />
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium">Street Address</Label>
                  <Input id="address" {...register("address")} placeholder="123 Builder St, Suite 100" className="h-9" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium">City</Label>
                  <Input id="city" {...register("city")} placeholder="City" className="h-9" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="font-medium">State / Province</Label>
                  <Controller name="state" control={control} render={({ field }) => <StateSelector countryName={selectedCountry} value={field.value} onChange={field.onChange} className="h-9" />} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="font-medium">Postal / Zip</Label>
                  <Input id="zipCode" {...register("zipCode")} placeholder="Zip Code" className="h-9" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="font-medium">Country</Label>
                  <Controller name="country" control={control} render={({ field }) => <CountrySelector value={field.value} onChange={(val) => { field.onChange(val); setValue('state', '') }} className="h-9" />} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId" className="font-medium">Tax ID / VAT Number</Label>
                  <Input id="taxId" {...register("taxId")} placeholder="Tax Identification Number" className="h-9" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="font-medium">
                    Default Currency <span className="text-destructive">*</span>
                  </Label>
                  <Select id="currency" value={selectedCurrency} onChange={(e) => setValue("currency", e.target.value as Currency)} className="h-9 w-full">
                    <option value="USD">{CURRENCY_NAMES.USD} (USD)</option>
                    <option value="INR">{CURRENCY_NAMES.INR} (INR)</option>
                  </Select>
                </div>
              </div>
            </div>

          {/* Save Button */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-border/60">
              <p className="text-sm font-medium">
                {isSaved && <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full inline-flex items-center"><Save className="w-3 h-3 mr-1"/> Changes saved successfully!</span>}
              </p>
              <Button type="submit" disabled={isSaving} size="lg" className="shadow-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
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

