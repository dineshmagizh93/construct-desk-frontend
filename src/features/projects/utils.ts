import type { Project } from './types'

export function nextProjectCode(projects: Project[]) {
  const max = projects.reduce((acc, p) => {
    const match = /^PRJ-(\d+)$/.exec(p.code)
    const num = match ? Number(match[1]) : 0
    return Math.max(acc, num)
  }, 0)
  return `PRJ-${String(max + 1).padStart(4, '0')}`
}
