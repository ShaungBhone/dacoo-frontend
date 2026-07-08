"use client"

import * as React from "react"

import { Navigation } from "@/components/navigation"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useOrganization } from "@/contexts/organization-context"
import { useTranslation } from "@/contexts/language-context"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  DatabaseIcon,
  ActivityIcon,
  BotIcon,
  CreditCardIcon,
  UsersIcon,
  WalletIcon,
  Building2Icon,
} from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    { title: "Playground", url: "/dashboard", icon: <TerminalSquareIcon /> },
    { title: "Agents", url: "/agents", icon: <BotIcon /> },
    { title: "Datasets", url: "/datasets", icon: <DatabaseIcon /> },
    // { title: "Experiments", url: "/experiments", icon: <FlaskConicalIcon /> },
    { title: "Customers", url: "/customers", icon: <UsersIcon /> },
    { title: "Activity", url: "/activity", icon: <ActivityIcon /> },
    { title: "Billing", url: "/billing", icon: <CreditCardIcon /> },
    { title: "Wallet", url: "/wallet", icon: <WalletIcon /> },
    { title: "Organization", url: "/organization", icon: <Building2Icon /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth()
  const { activeOrganizationId, setActiveOrganizationId } = useOrganization()
  const { t } = useTranslation()

  const teams = React.useMemo(() => {
    if (isLoading && !user) return []
    if (!user?.organizations || user.organizations.length === 0) {
      return [
        {
          id: -1,
          name: t("sidebar.personalWorkspace"),
          logo: <GalleryVerticalEndIcon />,
          plan: t("sidebar.basicPlan"),
        },
      ]
    }
    return user.organizations.map((org, index) => {
      const Logos = [GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon]
      const LogoIcon = Logos[index % Logos.length]
      return {
        id: org.id,
        name: org.name,
        logo: <LogoIcon />,
        plan: org.owner_id === user.id ? "Owner" : "Member",
      }
    })
  }, [user, isLoading, t])

  const sidebarUser = React.useMemo(() => {
    return {
      name: user?.name || "User",
      email: user?.email || "",
      avatar: `https://avatar.vercel.sh/${user?.email || "user"}.png`,
    }
  }, [user])

  const translatedNavMain = React.useMemo(() => {
    return data.navMain.map((item) => ({
      ...item,
      title: t(`common.${item.title.toLowerCase()}`),
    }))
  }, [t])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={teams}
          activeTeamId={activeOrganizationId}
          onTeamChange={setActiveOrganizationId}
        />
      </SidebarHeader>
      <SidebarContent>
        <Navigation navItems={translatedNavMain} user={sidebarUser} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
