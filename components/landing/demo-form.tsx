"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Star, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import toast from "react-hot-toast"

export function DemoForm() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Demo request submitted! We'll contact you soon.")
    setFormData({ name: "", phone: "", email: "" })
    setIsSubmitting(false)
    
    // Optionally redirect to registration
    // router.push("/register")
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Book Free 10 Min Demo
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill the form to see the product live
            </p>
          </div>

          {/* Value Proposition */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  New Launch - Be Among the First
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Get early access to cutting-edge construction management tools
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone/Mobile <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-lg">🇮🇳</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Mobile Number"
                  className="pl-12"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </form>

          {/* Trust Indicators */}
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>Free Trial</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
