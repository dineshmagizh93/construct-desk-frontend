import { Project, ProjectStats } from "@/types/project"

/**
 * Calculate project statistics from a list of projects
 */
export function calculateProjectStats(projects: Project[]): ProjectStats {
  const total = projects.length
  const active = projects.filter(
    (p) => p.status === "In Progress" || p.status === "Planning"
  ).length
  const averageProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0

  const byStatus = {
    Planning: projects.filter((p) => p.status === "Planning").length,
    "In Progress": projects.filter((p) => p.status === "In Progress").length,
    "On Hold": projects.filter((p) => p.status === "On Hold").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  }

  return {
    total,
    active,
    averageProgress,
    byStatus,
  }
}

/**
 * Get total number of projects
 */
export function getTotalProjects(projects: Project[]): number {
  return projects.length
}

/**
 * Get number of active projects (In Progress or Planning)
 */
export function getActiveProjects(projects: Project[]): number {
  return projects.filter((p) => p.status === "In Progress" || p.status === "Planning").length
}

/**
 * Calculate average progress percentage
 */
export function getAverageProgress(projects: Project[]): number {
  if (projects.length === 0) return 0
  return Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
}

/**
 * Get projects by status
 */
export function getProjectsByStatus(projects: Project[], status: Project["status"]): Project[] {
  return projects.filter((p) => p.status === status)
}

/**
 * Get recent projects (sorted by updated date)
 */
export function getRecentProjects(projects: Project[], limit: number = 5): Project[] {
  return [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}

