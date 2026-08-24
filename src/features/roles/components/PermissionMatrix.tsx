import { Fragment } from 'react'
import { MODULE_GROUPS, type ModuleKey, type PermissionMap } from '@/lib/modules'
import { Checkbox } from '@/components/ui/checkbox'

interface PermissionMatrixProps {
  value: PermissionMap
  onChange: (next: PermissionMap) => void
  readOnly?: boolean
}

const ACTIONS = [
  { key: 'view' as const, label: 'View' },
  { key: 'create' as const, label: 'Create' },
  { key: 'edit' as const, label: 'Edit' },
  { key: 'delete' as const, label: 'Delete' },
]

export function PermissionMatrix({ value, onChange, readOnly }: PermissionMatrixProps) {
  const toggle = (module: ModuleKey, action: keyof PermissionMap[ModuleKey], checked: boolean) => {
    if (readOnly) return
    onChange({
      ...value,
      [module]: { ...value[module], [action]: checked },
    })
  }

  const toggleRow = (module: ModuleKey, checked: boolean) => {
    if (readOnly) return
    onChange({
      ...value,
      [module]: { view: checked, create: checked, edit: checked, delete: checked },
    })
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40 text-left">
            <th className="px-3 py-2.5 font-medium">Module</th>
            {ACTIONS.map((action) => (
              <th key={action.key} className="px-3 py-2.5 text-center font-medium">
                {action.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULE_GROUPS.map((group) => (
            <Fragment key={group.label}>
              <tr className="bg-muted/30">
                <td colSpan={5} className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </td>
              </tr>
              {group.modules.map((mod) => (
                <tr key={mod.key} className="border-t border-border/60">
                  <td className="px-3 py-2">
                    <label className="flex items-center gap-2">
                      {!readOnly && (
                        <Checkbox
                          checked={ACTIONS.every((a) => value[mod.key][a.key])}
                          onChange={(e) => toggleRow(mod.key, e.target.checked)}
                        />
                      )}
                      <span>{mod.label}</span>
                    </label>
                  </td>
                  {ACTIONS.map((action) => (
                    <td key={action.key} className="px-3 py-2 text-center">
                      <Checkbox
                        checked={value[mod.key][action.key]}
                        disabled={readOnly}
                        onChange={(e) => toggle(mod.key, action.key, e.target.checked)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
