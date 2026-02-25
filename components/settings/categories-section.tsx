"use client"

import * as React from "react"
import { Tag, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Category {
  name: string
  count: number
  description: string
}

const categories: Category[] = [
  {
    name: "Expense Categories",
    count: 5,
    description: "Material, Labour, Transport, Equipment, Other",
  },
  {
    name: "Document Types",
    count: 6,
    description: "Agreement, Drawing, Bill, Invoice, Approval, Other",
  },
  {
    name: "Labour Categories",
    count: 7,
    description: "Mason, Helper, Carpenter, Electrician, Plumber, Painter, Other",
  },
  {
    name: "Project Status",
    count: 4,
    description: "Planning, In Progress, On Hold, Completed",
  },
  {
    name: "Payment Status",
    count: 3,
    description: "Pending, Paid, Overdue",
  },
  {
    name: "Lead Status",
    count: 5,
    description: "New, Contacted, Qualified, Converted, Lost",
  },
]

export function CategoriesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Categories
        </CardTitle>
        <CardDescription>System categories and classifications (read-only)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-start justify-between rounded-lg border bg-card p-4 hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{category.name}</h4>
                  <Badge variant="outline">{category.count} items</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-4" />
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            Category management will be available in a future update
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

