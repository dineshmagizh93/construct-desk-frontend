import { useNavigate } from 'react-router-dom'
import { Bell, Menu, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/lib/ui-store'
import { ROLE_LABELS } from '@/lib/constants'
import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotificationsUnreadCount } from '@/features/notifications/hooks'
import { GlobalSearch } from '@/features/search/GlobalSearch'

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen)
  const unread = useNotificationsUnreadCount()

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur">
      <button
        className="flex size-9 items-center justify-center rounded-md hover:bg-secondary lg:hidden"
        onClick={() => setMobileNavOpen(true)}
      >
        <Menu className="size-5" />
      </button>

      <GlobalSearch />

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative flex size-9 items-center justify-center rounded-md hover:bg-secondary"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-destructive" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-secondary">
              <Avatar className="size-7">
                <AvatarFallback>{initials(fullName || 'U')}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user?.firstName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate text-sm font-medium">{fullName}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {user?.companyRoleName ?? (user ? ROLE_LABELS[user.role] : '')}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <UserIcon /> My account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function TopbarActionButton() {
  return <Button size="sm">New</Button>
}
