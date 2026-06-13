"use client"

import { useState } from "react"
import { LayoutTemplate, Plus, Trash2, Pencil, Play, ChevronDown, ChevronRight, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { useProjectTemplates } from "@/lib/hooks/use-project-templates"
import { ProjectTemplate, TaskTemplate } from "@/lib/api/project-templates"
import { toast } from "react-hot-toast"

const CATEGORIES = ["Residential", "Commercial", "Industrial", "Renovation", "Infrastructure", "Other"]

function TaskRow({
  task,
  index,
  onChange,
  onRemove,
}: {
  task: TaskTemplate
  index: number
  onChange: (i: number, t: TaskTemplate) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-slate-200 text-[11px] font-medium text-slate-600">
        {index + 1}
      </span>
      <Input
        className="h-7 flex-1 text-[12px]"
        placeholder="Task title"
        value={task.title}
        onChange={(e) => onChange(index, { ...task, title: e.target.value })}
      />
      <Input
        className="h-7 w-20 text-[12px]"
        type="number"
        min={0}
        placeholder="Day"
        title="Start day offset"
        value={task.offsetDays ?? ""}
        onChange={(e) => onChange(index, { ...task, offsetDays: Number(e.target.value) })}
      />
      <Input
        className="h-7 w-20 text-[12px]"
        type="number"
        min={1}
        placeholder="Hrs"
        title="Estimated hours"
        value={task.estimatedHours ?? ""}
        onChange={(e) => onChange(index, { ...task, estimatedHours: Number(e.target.value) })}
      />
      <button
        onClick={() => onRemove(index)}
        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function TemplateFormDialog({
  open,
  template,
  onClose,
  onSave,
}: {
  open: boolean
  template?: ProjectTemplate
  onClose: () => void
  onSave: (data: Partial<ProjectTemplate>) => Promise<void>
}) {
  const isEdit = !!template
  const [name, setName] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")
  const [category, setCategory] = useState(template?.category || "")
  const [tasks, setTasks] = useState<TaskTemplate[]>(template?.tasks || [])
  const [saving, setSaving] = useState(false)

  const handleTaskChange = (i: number, t: TaskTemplate) => {
    setTasks((prev) => prev.map((existing, idx) => (idx === i ? t : existing)))
  }

  const handleRemoveTask = (i: number) => {
    setTasks((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleAddTask = () => {
    setTasks((prev) => [...prev, { title: "", offsetDays: prev.length, estimatedHours: 8, priority: "medium" }])
  }

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Template name is required")
    const invalidTask = tasks.find((t) => !t.title.trim())
    if (invalidTask) return toast.error("All tasks must have a title")
    setSaving(true)
    try {
      await onSave({ name, description, category, tasks })
      onClose()
    } catch {
      toast.error("Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Template" : "New Project Template"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-[13px]">Template Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard House Build" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Category</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-[13px] shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What type of projects is this template for?"
              rows={2}
              className="text-[13px]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[13px]">Tasks ({tasks.length})</Label>
              <p className="text-[11px] text-slate-400">Day offset | Est. hours</p>
            </div>
            <div className="space-y-1.5">
              {tasks.map((t, i) => (
                <TaskRow key={i} task={t} index={i} onChange={handleTaskChange} onRemove={handleRemoveTask} />
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full text-[13px]" onClick={handleAddTask}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Task
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: ProjectTemplate
  onEdit: () => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <LayoutTemplate className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-800">{template.name}</p>
            <div className="mt-0.5 flex items-center gap-2">
              {template.category && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                  {template.category}
                </span>
              )}
              <span className="text-[12px] text-slate-400">{template.tasks?.length || 0} tasks</span>
            </div>
            {template.description && (
              <p className="mt-1 text-[12px] text-slate-500">{template.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-400 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {template.tasks && template.tasks.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600"
          >
            {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {expanded ? "Hide tasks" : "Show tasks"}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1">
              {template.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1.5">
                  <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm bg-slate-200 text-[10px] font-medium text-slate-500">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12px] text-slate-700">{task.title}</span>
                  {task.offsetDays !== undefined && (
                    <span className="text-[11px] text-slate-400">Day {task.offsetDays}</span>
                  )}
                  {task.estimatedHours && (
                    <span className="text-[11px] text-slate-400">{task.estimatedHours}h</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProjectTemplatesPage() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useProjectTemplates()
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProjectTemplate | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | undefined>()
  const [search, setSearch] = useState("")

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (data: Partial<ProjectTemplate>) => {
    if (editTarget) {
      await updateTemplate(editTarget.id, data)
      toast.success("Template updated")
    } else {
      await createTemplate(data)
      toast.success("Template created")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteTemplate(deleteTarget)
    toast.success("Template deleted")
    setDeleteTarget(undefined)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <LayoutTemplate className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-slate-800">Project Templates</h1>
            <p className="text-[13px] text-slate-500">Reusable task blueprints for new projects</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditTarget(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Input
          placeholder="Search templates..."
          className="text-[13px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No templates yet"
          description="Create reusable project blueprints with tasks to speed up project setup."
          action={{ label: "Create Template", onClick: () => setFormOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => {
                setEditTarget(t)
                setFormOpen(true)
              }}
              onDelete={() => setDeleteTarget(t.id)}
            />
          ))}
        </div>
      )}

      <TemplateFormDialog
        open={formOpen}
        template={editTarget}
        onClose={() => {
          setFormOpen(false)
          setEditTarget(undefined)
        }}
        onSave={handleSave}
      />

      {deleteTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDeleteTarget(undefined)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold text-slate-800">Delete Template</h2>
            <p className="mt-2 text-[13px] text-slate-500">
              This template will be permanently deleted. Projects that used it won&apos;t be affected.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(undefined)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

