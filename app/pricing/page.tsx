"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/config"
import { PublicHeader } from "@/components/landing/public-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, ArrowRight, Zap, Building2, Crown, Users, HardDrive, HeadphonesIcon, Code, X } from "lucide-react"
import { subscriptionApi, PlanName } from "@/lib/api/subscription"
import toast from "react-hot-toast"

type Currency = "USD" | "INR"
type BillingPeriod = "monthly" | "yearly"

const USD_TO_INR = 85 // static conversion rate for display purposes
const YEARLY_DISCOUNT = 0.8 // 20% discount for yearly billing

export default function PricingPage() {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [selectedAddon, setSelectedAddon] = React.useState<number | null>(null)
  const [currency, setCurrency] = React.useState<Currency>("INR")
  const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>("monthly")
  const [loading, setLoading] = React.useState<string | null>(null)

  const handleSubscribe = async (planName: string) => {
    const token = getAuthToken()
    
    if (!token) {
      // Redirect to register if not logged in
      router.push("/register")
      return
    }

    // Map plan names to PlanName type
    const planMap: Record<string, PlanName> = {
      "Starter": "STARTER",
      "Growth": "GROWTH",
      "Professional": "PROFESSIONAL",
    }

    const planNameTyped = planMap[planName] as PlanName
    if (!planNameTyped) {
      toast.error("Invalid plan selected")
      return
    }

    try {
      setLoading(planName)

      const response = await subscriptionApi.createCheckoutSession(
        planNameTyped,
        billingPeriod,
      )

      if (!response.url) {
        throw new Error("No checkout URL received from server")
      }

      toast.success("Redirecting to checkout...")

      setTimeout(() => {
        window.location.href = response.url
      }, 500)
    } catch (error: any) {
      const message = (error as any)?.message || ""

      let errorMessage = "Failed to start checkout. Please try again."

      if (message) {
        if (message.includes("Stripe is not configured") || message.includes("Razorpay is not configured")) {
          errorMessage = "Payment processing is not configured. Please contact support."
        } else if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else {
          errorMessage = message
        }
      }

      toast.error(errorMessage)
      setLoading(null)
    }
  }

  React.useEffect(() => {
    setMounted(true)
    const token = getAuthToken()
    if (token) {
      // Allow authenticated users to view pricing
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small contractors and startups.",
      priceInrMonthly: 2999,
      period: "/month",
      icon: Zap,
      popular: false,
      features: [
        "3 users",
        "Up to 5 projects",
        "Dashboard",
        "Project management",
        "Task tracking",
        "Leads & client management",
        "Site progress tracking",
        "Payment & expense tracking",
        "Basic reports",
        "Document storage (10GB)",
        "Mobile access",
        "Email support",
      ],
      limitations: [
        "No inventory module",
        "No vendor management",
        "No labour management",
        "Limited analytics",
      ],
    },
    {
      name: "Growth",
      description: "For growing construction businesses.",
      priceInrMonthly: 6999,
      period: "/month",
      icon: Building2,
      popular: true,
      features: [
        "10 users",
        "Up to 25 projects",
        "Everything in Starter",
        "Inventory management",
        "Vendor management",
        "Labour management",
        "Advanced reports",
        "Role-based permissions",
        "Document storage (50GB)",
        "Priority email support",
      ],
      limitations: [],
    },
    {
      name: "Professional",
      description: "For high-volume construction teams.",
      priceInrMonthly: 12999,
      period: "/month",
      icon: Crown,
      popular: false,
      features: [
        "30 users",
        "Unlimited projects",
        "Everything in Growth",
        "Custom dashboards",
        "Project profitability tracking",
        "Advanced analytics",
        "API access",
        "Webhooks",
        "Document storage (200GB)",
        "Integration support",
      ],
      limitations: [],
    },
  ]

  const addOns = [
    {
      name: "Additional Users",
      description: "Add more users to your plan",
      priceUsd: 250 / USD_TO_INR,
      unit: "/user/month",
      icon: Users,
      details: {
        title: "Additional Users",
        description: "Scale your team by adding more users to your ConstructDesk account. Each additional user gets full access to all features included in your plan.",
        features: [
          "Full access to all plan features",
          "Individual user accounts with secure login",
          "Role-based permissions (Admin, Manager, User)",
          "Personal dashboard and preferences",
          "Email notifications and alerts",
          "Mobile app access",
          "No limit on number of users you can add",
        ],
        useCases: [
          "Growing teams that need more access",
          "Adding subcontractors or external partners",
          "Expanding project teams",
          "Multi-department access",
        ],
        pricing: "₹250 per user per month (or equivalent in USD). Billed monthly with your main subscription.",
      },
    },
    {
      name: "Extra Storage",
      description: "Additional document storage space",
      priceUsd: 399 / USD_TO_INR,
      unit: "/50GB/month",
      icon: HardDrive,
      details: {
        title: "Extra Storage",
        description: "Expand your document storage capacity beyond your plan's included storage. Perfect for companies with extensive documentation needs.",
        features: [
          "50GB additional storage per add-on",
          "Secure cloud storage with encryption",
          "Unlimited file uploads",
          "Support for all file types (PDFs, images, videos, CAD files)",
          "Version control and file history",
          "Fast upload and download speeds",
          "Automatic backup and redundancy",
        ],
        useCases: [
          "Large project documentation",
          "High-resolution photos and videos",
              "CAD drawings and blueprints",
          "Legal documents and contracts",
          "Historical project archives",
        ],
        pricing: "₹399 per 50GB per month. You can purchase multiple add-ons for additional storage (e.g., 2 add-ons = 100GB).",
      },
    },
    {
      name: "Priority Support",
      description: "24/7 priority support with SLA",
      priceUsd: 4999 / USD_TO_INR,
      unit: "/month",
      icon: HeadphonesIcon,
      details: {
        title: "Priority Support",
        description: "Get dedicated priority support with guaranteed response times and 24/7 availability. Perfect for businesses that need immediate assistance.",
        features: [
          "24/7 phone and email support",
          "Guaranteed 1-hour response time for critical issues",
          "4-hour response time for standard issues",
          "Dedicated support ticket queue",
          "Priority escalation to senior support engineers",
          "Scheduled support calls and consultations",
          "Proactive system monitoring and alerts",
          "Custom training sessions for your team",
        ],
        useCases: [
          "Mission-critical operations",
          "Large teams requiring frequent support",
          "Complex implementation needs",
          "Time-sensitive project deadlines",
        ],
        pricing: "₹4,999 per month. Includes unlimited support tickets and priority access to all support channels.",
      },
    },
    {
      name: "Custom Integrations",
      description: "Custom API integrations and webhooks",
      priceUsd: null as number | null,
      unit: "",
      icon: Code,
      details: {
        title: "Custom Integrations",
        description: "Connect ConstructDesk with your existing business tools and systems through custom API integrations and webhooks. Tailored to your specific workflow needs.",
        features: [
          "Custom API development and integration",
          "Webhook configuration for real-time data sync",
          "Integration with accounting software (QuickBooks, Xero, etc.)",
          "ERP system connectivity",
          "Third-party tool integrations",
          "Custom data mapping and transformation",
          "Ongoing maintenance and updates",
          "Dedicated integration support",
        ],
        useCases: [
          "Connecting with existing business systems",
          "Automating data flow between platforms",
          "Custom reporting and analytics",
          "Workflow automation",
          "Legacy system integration",
        ],
        pricing: "Custom pricing based on integration complexity and requirements. Contact our sales team for a detailed quote. Typical range: ₹50,000 - ₹5,00,000 one-time setup + monthly maintenance fees.",
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left space-y-3 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Simple, Transparent
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {" "}Pricing
                </span>
              </h1>
              <p className="text-base text-muted-foreground">
                Choose the perfect plan for your construction business. All plans include a 14-day free trial. 
                No credit card required.
              </p>
            </div>

            {/* Toggles Container */}
            <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
              {/* Currency Toggle */}
              <div className="flex items-center gap-2 bg-muted/60 rounded-lg p-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currency === "USD"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currency === "INR"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  INR (₹)
                </button>
              </div>

              {/* Billing Toggle */}
              <div className="flex items-center gap-2 bg-muted/60 rounded-lg p-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingPeriod === "monthly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
                    billingPeriod === "yearly"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="text-xs font-semibold">(Save 20%)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-4">
            {plans.map((plan, index) => {
              const Icon = plan.icon as any

              let priceLabel = "Custom"
              let subLabel = ""

              if (plan.priceInrMonthly !== null) {
                const monthlyInr = plan.priceInrMonthly
                const yearlyInr = Math.round(monthlyInr * 12 * YEARLY_DISCOUNT)

                if (currency === "USD") {
                  const monthlyUsd = monthlyInr / USD_TO_INR
                  const yearlyUsd = yearlyInr / USD_TO_INR
                  if (billingPeriod === "monthly") {
                    priceLabel = `$${monthlyUsd.toFixed(0)}`
                    subLabel = "/month"
                  } else {
                    priceLabel = `$${yearlyUsd.toFixed(0)}`
                    subLabel = "/year (billed yearly)"
                  }
                } else {
                  if (billingPeriod === "monthly") {
                    priceLabel = `₹${monthlyInr.toLocaleString("en-IN")}`
                    subLabel = "/month"
                  } else {
                    priceLabel = `₹${yearlyInr.toLocaleString("en-IN")}`
                    subLabel = "/year (billed yearly)"
                  }
                }
              }

              return (
                <Card
                  key={index}
                  className={plan.popular ? "border-primary shadow-lg scale-105" : ""}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={plan.popular ? "pt-6" : ""}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${plan.popular ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">{priceLabel}</span>
                          {subLabel && <span className="text-muted-foreground">{subLabel}</span>}
                      </div>
                      {plan.priceInrMonthly != null && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {billingPeriod === "monthly" ? "Billed monthly" : "Billed yearly"}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={loading === plan.name}
                    >
                      {loading === plan.name ? (
                        "Processing..."
                      ) : (
                        <>
                          {getAuthToken() ? "Subscribe Now" : "Start Free Trial"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <div className="space-y-3 pt-4">
                      <p className="text-sm font-semibold">Includes:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.limitations.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <p className="text-sm font-semibold text-muted-foreground mb-2">Limitations:</p>
                          <ul className="space-y-1">
                            {plan.limitations.map((limitation, limIndex) => (
                              <li key={limIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="mt-0.5">•</span>
                                <span>{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-2xl font-bold">Add-ons & Extensions</h2>
            <p className="text-sm text-muted-foreground">
              Enhance your plan with additional features and services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => {
              let priceLabel = "Custom pricing"
              if (addon.priceUsd !== null) {
                const monthlyInr = addon.priceUsd * USD_TO_INR
                const yearlyInr = Math.round(monthlyInr * 12 * YEARLY_DISCOUNT)

                if (currency === "USD") {
                  const monthlyUsd = monthlyInr / USD_TO_INR
                  const yearlyUsd = yearlyInr / USD_TO_INR
                  if (billingPeriod === "monthly") {
                    priceLabel = `$${monthlyUsd.toFixed(0)}${addon.unit}`
                  } else {
                    priceLabel = `$${yearlyUsd.toFixed(0)}${addon.unit.replace("/month", "/year")}`
                  }
                } else {
                  if (billingPeriod === "monthly") {
                    priceLabel = `₹${monthlyInr.toLocaleString("en-IN")}${addon.unit}`
                  } else {
                    priceLabel = `₹${yearlyInr.toLocaleString("en-IN")}${addon.unit.replace("/month", "/year")}`
                  }
                }
              }

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{addon.name}</CardTitle>
                    <CardDescription>{addon.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold mb-4">{priceLabel}</p>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => setSelectedAddon(index)}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Add-on Details Dialog */}
      {selectedAddon !== null && addOns[selectedAddon] && (
        <Dialog open={selectedAddon !== null} onOpenChange={() => setSelectedAddon(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const Icon = addOns[selectedAddon].icon
                  return <Icon className="h-6 w-6 text-primary" />
                })()}
                <DialogTitle className="text-lg">{addOns[selectedAddon].details.title}</DialogTitle>
              </div>
              <DialogDescription className="text-sm">
                {addOns[selectedAddon].details.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Features */}
              <div>
                <h3 className="font-semibold text-base mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {addOns[selectedAddon].details.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="font-semibold text-base mb-3">Ideal For</h3>
                <ul className="space-y-2">
                  {addOns[selectedAddon].details.useCases.map((useCase, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm text-muted-foreground">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                <h3 className="font-semibold text-base mb-2">Pricing Details</h3>
                <p className="text-sm text-muted-foreground">{addOns[selectedAddon].details.pricing}</p>
              </div>

              {/* CTA */}
              <div className="flex gap-3 pt-4 border-t border-border/40">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setSelectedAddon(null)
                    router.push("/register")
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedAddon(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Comparison Table */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-2xl font-bold">Compare Plans</h2>
            <p className="text-sm text-muted-foreground">
              See which plan fits your construction business best.
            </p>
          </div>

          <div className="overflow-x-auto border border-border/40 rounded-lg bg-card">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Feature</th>
                  {plans.map((plan, index) => (
                    <th key={index} className="px-4 py-3 text-center font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Users included",
                    values: ["3 users", "10 users", "30 users"],
                  },
                  {
                    label: "Projects",
                    values: ["Up to 5", "Up to 25", "Unlimited"],
                  },
                  {
                    label: "Dashboard & Projects",
                    values: [true, true, true],
                  },
                  {
                    label: "Tasks & Kanban boards",
                    values: [true, true, true],
                  },
                  {
                    label: "Leads & Clients",
                    values: [true, true, true],
                  },
                  {
                    label: "Site Progress",
                    values: [true, true, true],
                  },
                  {
                    label: "Payments & Expenses",
                    values: [true, true, true],
                  },
                  {
                    label: "Inventory",
                    values: [false, true, true],
                  },
                  {
                    label: "Vendors",
                    values: [false, true, true],
                  },
                  {
                    label: "Labour",
                    values: [false, true, true],
                  },
                  {
                    label: "Advanced Reports & Analytics",
                    values: [false, true, true],
                  },
                  {
                    label: "Custom Dashboards",
                    values: [false, false, true],
                  },
                  {
                    label: "API & Webhooks",
                    values: [false, false, true],
                  },
                ].map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/40"}
                  >
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    {row.values.map((value, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="h-4 w-4 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "Do you offer a free trial?",
                a: "Yes! All plans include a 14-day free trial. No credit card required. You can cancel anytime during the trial period.",
              },
              {
                q: "Can I change plans later?",
                a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and ACH transfers.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees for any of our plans.",
              },
              {
                q: "Do you offer discounts for annual plans?",
                a: "Yes! Save 20% when you pay annually. Contact our sales team for more information.",
              },
              {
                q: "What happens if I exceed my plan limits?",
                a: "We'll notify you before you reach your limits. You can upgrade your plan or purchase add-ons to accommodate your needs.",
              },
            ].map((faq, index) => (
              <div key={index} className="p-6 rounded-lg border border-border/40 bg-card">
                <h3 className="text-sm font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Still have questions?</h2>
          <p className="text-base text-muted-foreground">
            Our team is here to help you choose the right plan for your business
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => router.push("/register")}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-lg font-bold">ConstructDesk</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All-in-one construction management software for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground">Features</a></li>
                <li><a href="/#solutions" className="hover:text-foreground">Solutions</a></li>
                <li><a href="/pricing" className="hover:text-foreground">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#contact" className="hover:text-foreground">Contact Us</a></li>
                <li><a href="/#resources" className="hover:text-foreground">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/register" className="hover:text-foreground">Sign Up</a></li>
                <li><a href="/login" className="hover:text-foreground">Sign In</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ConstructDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
