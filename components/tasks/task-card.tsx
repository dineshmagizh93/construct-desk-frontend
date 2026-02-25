"use client"

import * as React from "react"
import { Task, TaskPriority } from "@/lib/api/tasks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, User, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onDragStart, onClick, isDragging }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done"
  const priorityColors = {
    [TaskPriority.URGENT]: "bg-red-500",
    [TaskPriority.HIGH]: "bg-orange-500",
    [TaskPriority.MEDIUM]: "bg-yellow-500",
    [TaskPriority.LOW]: "bg-blue-500",
  }

  const getInitials = (user?: { firstName?: string; lastName?: string; email?: string }) => {
    if (!user) return "?"
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return "?"
  }

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`cursor-pointer hover:shadow-md transition-all ${
        isDragging ? "opacity-50" : ""
      } ${isOverdue ? "border-destructive" : ""}`}
    >
      <div className="p-4 space-y-3">
        {/* Priority Indicator */}
        <div className="flex items-start justify-between">
          <div className={`w-1 h-6 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`} />
          {isOverdue && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className="flex flex-wrap gap-1">
            {task.labels.split(",").map((label, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {label.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {task.assignee ? (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            {task.project && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {task.project.name}
              </span>
            )}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </div>
          )}
        </div>

        {/* Counts */}
        {(task._count?.comments || task._count?.activities) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task._count.comments > 0 && (
              <span>💬 {task._count.comments}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

