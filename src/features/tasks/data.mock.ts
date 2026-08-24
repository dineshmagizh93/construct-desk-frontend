import type { Task } from './types'

export const TASKS_SEED: Task[] = [
  { id: 'task-1', title: 'Electrical rough-in — Block C', projectId: 'PRJ-0001', assignee: 'Suresh Kumar', priority: 'high', status: 'in_progress', dueDate: '2026-07-10', description: 'Complete conduit and wiring rough-in for Block C floors 1-4.' },
  { id: 'task-2', title: 'Plumbing inspection — Tower B', projectId: 'PRJ-0001', assignee: 'Manoj Rao', priority: 'medium', status: 'todo', dueDate: '2026-07-14', description: 'Third-party plumbing inspection before slab pour.' },
  { id: 'task-3', title: 'Interior wall plastering', projectId: 'PRJ-0002', assignee: 'Manoj Rao', priority: 'medium', status: 'in_progress', dueDate: '2026-07-08', description: 'Finish plastering for ground floor interior walls.' },
  { id: 'task-4', title: 'Facade cladding order', projectId: 'PRJ-0002', assignee: 'Priya Nair', priority: 'low', status: 'todo', dueDate: '2026-07-20', description: 'Place order for ACP cladding sheets with approved vendor.' },
  { id: 'task-5', title: 'Soil testing report review', projectId: 'PRJ-0003', assignee: 'Arun Mehta', priority: 'high', status: 'in_progress', dueDate: '2026-07-12', description: 'Review geotechnical report before finalizing foundation design.' },
  { id: 'task-6', title: 'Fire safety system install', projectId: 'PRJ-0006', assignee: 'Suresh Kumar', priority: 'high', status: 'in_progress', dueDate: '2026-07-18', description: 'Install sprinkler and fire alarm system in warehouse block.' },
  { id: 'task-7', title: 'Structural audit — Tower A', projectId: 'PRJ-0001', assignee: 'Suresh Kumar', priority: 'medium', status: 'done', dueDate: '2026-06-28', description: 'Post-construction structural audit for handover.' },
  { id: 'task-8', title: 'Waterproofing — terrace slab', projectId: 'PRJ-0002', assignee: 'Manoj Rao', priority: 'medium', status: 'todo', dueDate: '2026-07-22', description: 'Apply waterproofing membrane on terrace before handover.' },
  { id: 'task-9', title: 'Lift shaft alignment check', projectId: 'PRJ-0001', assignee: 'Suresh Kumar', priority: 'high', status: 'todo', dueDate: '2026-07-16', description: 'Verify lift shaft plumbness across all floors.' },
  { id: 'task-10', title: 'Landscape design approval', projectId: 'PRJ-0007', assignee: 'Priya Nair', priority: 'low', status: 'todo', dueDate: '2026-08-05', description: 'Get client sign-off on landscape design concept.' },
  { id: 'task-11', title: 'PEB roof sheeting', projectId: 'PRJ-0006', assignee: 'Suresh Kumar', priority: 'medium', status: 'in_progress', dueDate: '2026-07-15', description: 'Install roof sheeting on the warehouse superstructure.' },
  { id: 'task-12', title: 'Boundary wall construction', projectId: 'PRJ-0008', assignee: 'Manoj Rao', priority: 'medium', status: 'todo', dueDate: '2026-07-28', description: 'Construct compound wall around the logistics park perimeter.' },
  { id: 'task-13', title: 'Handover documentation', projectId: 'PRJ-0009', assignee: 'Priya Nair', priority: 'low', status: 'done', dueDate: '2026-01-05', description: 'Prepare handover documents and warranty booklets.' },
  { id: 'task-14', title: 'Girder launching', projectId: 'PRJ-0010', assignee: 'Arun Mehta', priority: 'high', status: 'in_progress', dueDate: '2026-07-20', description: 'Launch precast girders for the flyover span 4.' },
  { id: 'task-15', title: 'HVAC ductwork layout', projectId: 'PRJ-0011', assignee: 'Suresh Kumar', priority: 'medium', status: 'todo', dueDate: '2026-08-01', description: 'Finalize ductwork routing for Tower 1 office floors.' },
  { id: 'task-16', title: 'Row house foundation', projectId: 'PRJ-0012', assignee: 'Manoj Rao', priority: 'high', status: 'in_progress', dueDate: '2026-07-11', description: 'Complete foundation work for row houses 1-10.' },
  { id: 'task-17', title: 'Retail unit partitioning', projectId: 'PRJ-0013', assignee: 'Priya Nair', priority: 'medium', status: 'todo', dueDate: '2026-07-25', description: 'Install partition walls for new retail units on level 2.' },
  { id: 'task-18', title: 'Amphitheater seating layout', projectId: 'PRJ-0014', assignee: 'Arun Mehta', priority: 'low', status: 'todo', dueDate: '2026-10-15', description: 'Finalize tiered seating layout for the amphitheater.' },
  { id: 'task-19', title: 'Machine foundation grouting', projectId: 'PRJ-0015', assignee: 'Suresh Kumar', priority: 'medium', status: 'done', dueDate: '2026-02-10', description: 'Grout heavy machine foundations before equipment install.' },
  { id: 'task-20', title: 'Rooftop solar mounting', projectId: 'PRJ-0016', assignee: 'Manoj Rao', priority: 'low', status: 'todo', dueDate: '2026-08-10', description: 'Install mounting structures for rooftop solar panels.' },
]
