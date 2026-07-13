"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useTranslation } from "@/contexts/language-context"
import { useOrganization } from "@/contexts/organization-context"
import {
  BadgeCheckIcon,
  BellIcon,
  Building2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
  PlusIcon,
  SparklesIcon,
} from "lucide-react"

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  )
}

export function SidebarProfile() {
  const { user, logout } = useAuth()
  const {
    organizations,
    activeOrganization,
    activeOrganizationId,
    setActiveOrganizationId,
  } = useOrganization()
  const { t } = useTranslation()
  const { isMobile } = useSidebar()

  const name = user?.name || "User"
  const email = user?.email || ""
  const avatar = `https://avatar.vercel.sh/${email || "user"}.png`
  const initials = getInitials(name)
  const workspaceName =
    activeOrganization?.name || t("sidebar.personalWorkspace")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              aria-label={t("userDropdown.openProfileMenu")}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{workspaceName}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-72"
            align="end"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("userDropdown.workspaces")}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {organizations.length > 0 ? (
                organizations.map((organization) => (
                  <DropdownMenuItem
                    key={organization.id}
                    onSelect={() => setActiveOrganizationId(organization.id)}
                  >
                    <Building2Icon />
                    <span className="truncate">{organization.name}</span>
                    {organization.id === activeOrganizationId && (
                      <CheckIcon className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <Building2Icon />
                  <span className="truncate">
                    {t("sidebar.personalWorkspace")}
                  </span>
                  <CheckIcon className="ml-auto" />
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <PlusIcon />
                {t("userDropdown.addWorkspace")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparklesIcon />
                {t("userDropdown.upgrade")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                {t("userDropdown.account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                {t("common.billing")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                {t("userDropdown.notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={logout}>
                <LogOutIcon />
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
