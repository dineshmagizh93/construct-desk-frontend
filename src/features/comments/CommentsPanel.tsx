import { useMemo, useState } from 'react'
import { AtSign, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/features/auth/store'
import { useAssignableUsers } from '@/features/users/hooks'
import { usePermission } from '@/lib/permissions'
import { formatDate } from '@/lib/utils'
import { useAddComment, useComments, useDeleteComment, type CommentEntity } from './api'
import { extractMentions, insertMention, segmentBody } from './mentions'

const MODULE_FOR: Record<CommentEntity, string> = { Task: 'tasks', Lead: 'leads' }

/** The discussion on one task or lead: newest at the bottom, @mention teammates to notify them. */
export function CommentsPanel({ entity, entityId }: { entity: CommentEntity; entityId: string }) {
  const { data: comments = [], isLoading } = useComments(entity, entityId)
  const { data: users = [] } = useAssignableUsers()
  const addMutation = useAddComment(entity, entityId)
  const deleteMutation = useDeleteComment(entity, entityId)
  const me = useAuthStore((s) => s.user)
  const canComment = usePermission(MODULE_FOR[entity], 'edit')
  const [text, setText] = useState('')

  const people = useMemo(() => users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() })), [users])
  const isAdmin = me?.role === 'admin' || me?.role === 'super_admin'

  const post = async () => {
    const body = text.trim()
    if (!body || addMutation.isPending) return
    await addMutation.mutateAsync({ body, mentionedIds: extractMentions(body, people).map((p) => p.id) })
    setText('')
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Discussion</p>

      <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c.id} className="group rounded-md bg-secondary/40 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{c.authorName}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {formatDate(c.createdAt, { hour: '2-digit', minute: '2-digit' })}
                {(c.authorId === me?.id || isAdmin) && (
                  <Button variant="ghost" size="icon-sm" title="Delete comment" onClick={() => deleteMutation.mutate(c.id)} disabled={deleteMutation.isPending}>
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                )}
              </span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words">
              {segmentBody(c.body, people).map((segment, i) =>
                segment.mention ? (
                  <span key={i} className="rounded bg-primary/10 px-0.5 font-medium text-primary">
                    {segment.text}
                  </span>
                ) : (
                  <span key={i}>{segment.text}</span>
                ),
              )}
            </p>
          </div>
        ))}
      </div>

      {canComment && (
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                void post()
              }
            }}
            placeholder="Write a comment… use @ to tag a teammate"
            maxLength={2000}
            rows={2}
          />
          <div className="flex items-center justify-between gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  <AtSign className="size-4" /> Tag someone
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-60 overflow-y-auto">
                {people.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setText((t) => insertMention(t, p.name))}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={post} disabled={!text.trim() || addMutation.isPending}>
              <Send className="size-4" /> Post
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
