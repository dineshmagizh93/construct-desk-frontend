"use client"

import * as React from "react"
import { Task, TaskPriority } from "@/lib/api/tasks"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, User, AlertCircle } from "lucide-react"
import { formatDateDMY } from "@/lib/utils/date"

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
      className={`cursor-pointer hover:shadow-md transition-all w-full ${
        isDragging ? "opacity-50" : ""
      } ${isOverdue ? "border-destructive" : ""}`}
    >
      <div className="p-2 space-y-1.5">
        {/* Priority Indicator */}
        <div className="flex items-start justify-between">
          <div className={`w-0.5 h-4 rounded-full ${priorityColors[task.priority] || "bg-gray-500"}`} />
          {isOverdue && (
            <AlertCircle className="h-3 w-3 text-destructive" />
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-xs line-clamp-2 leading-tight">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">{task.description}</p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className="flex flex-wrap gap-0.5">
            {task.labels.split(",").slice(0, 2).map((label, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                {label.trim()}
              </Badge>
            ))}
            {task.labels.split(",").length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                +{task.labels.split(",").length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {task.assignee ? (
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            )}
            {task.project && (
              <span className="text-[10px] text-muted-foreground truncate">
                {task.project.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {(task._count?.comments ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground">💬 {task._count?.comments}</span>
            )}
            {task.dueDate && (
              <div className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                <Calendar className="h-2.5 w-2.5" />
                {formatDateDMY(task.dueDate)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

