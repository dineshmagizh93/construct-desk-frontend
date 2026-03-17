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
        <CardTitle className="flex items-center gap-2 text-xl">
          <Tag className="h-5 w-5 text-primary" />
          System Categories
        </CardTitle>
        <CardDescription>View system classifications and category counts</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-6 px-6">
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-center rounded-xl border border-border/50 bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    <Tag className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold tracking-tight">{category.name}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="font-medium bg-secondary/50">
                    {category.count}
                  </Badge>
                  <Lock className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed ml-11 line-clamp-2">
                {category.description}
              </p>
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

