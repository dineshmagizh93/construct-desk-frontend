"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Calendar, DollarSign, FileText } from "lucide-react"
import { labourApi } from "@/lib/api/labour"
import { Labour } from "@/types/labour"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LabourDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [labour, setLabour] = React.useState<Labour | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadLabour = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          setLoading(true)
          const data = await labourApi.getById(params.id)
          setLabour(data)
        } catch (error) {
          console.error("Failed to load labour:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadLabour()
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading labour entry...</div>
  }

  if (!labour) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/labour")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Labour
        </Button>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Labour entry not found</p>
        </div>
      </div>
    )
  }

  const totalCost = labour.headcount * labour.costPerDay

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/labour")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Labour Entry Details</h1>
            <p className="text-muted-foreground">
              <Link href={`/projects/${labour.projectId}`} className="hover:underline">
                {labour.projectName}
              </Link>
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/labour/${labour.id}/edit`)}>
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">${totalCost.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {labour.headcount} workers × ${labour.costPerDay.toLocaleString()} per day
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Labour Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Category</p>
                <Badge variant="outline" className="mt-1">
                  {labour.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Headcount</p>
                <p className="text-sm text-muted-foreground">{labour.headcount} workers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Cost Per Day</p>
                <p className="text-sm text-muted-foreground">${labour.costPerDay.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(labour.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Project</p>
              <Link
                href={`/projects/${labour.projectId}`}
                className="text-sm text-primary hover:underline"
              >
                {labour.projectName}
              </Link>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Category</p>
              <Badge variant="outline">{labour.category}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Created</p>
              <p className="text-sm text-muted-foreground">
                {new Date(labour.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {new Date(labour.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {labour.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{labour.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
