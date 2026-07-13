"use client"

import * as React from "react"

import { AppLogo } from "@/components/app-logo"
import { Navigation } from "@/components/navigation"
import { SidebarProfile } from "@/components/sidebar-profile"
import { useTranslation } from "@/contexts/language-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  TerminalSquareIcon,
  DatabaseIcon,
  ActivityIcon,
  BotIcon,
  CreditCardIcon,
  UsersIcon,
  WalletIcon,
  BarChart2Icon,
} from "lucide-react"

// This is sample data.
const data = {
  navGroups: [
    {
      group: "Tools",
      items: [
        {
          title: "Playground",
          url: "/dashboard",
          icon: <TerminalSquareIcon />,
        },
        { title: "Agents", url: "/agents", icon: <BotIcon /> },
        { title: "Datasets", url: "/datasets", icon: <DatabaseIcon /> },
      ],
    },
    {
      group: "Management",
      items: [
        { title: "Customers", url: "/customers", icon: <UsersIcon /> },
        { title: "Activity", url: "/activity", icon: <ActivityIcon /> },
        { title: "Analytics", url: "/analytics", icon: <BarChart2Icon /> },
      ],
    },
    {
      group: "Finance",
      items: [
        { title: "Billing", url: "/billing", icon: <CreditCardIcon /> },
        { title: "Wallet", url: "/wallet", icon: <WalletIcon /> },
        { title: "Cards", url: "/cards", icon: <CreditCardIcon /> },
      ],
    },
    {
      group: "Settings",
      items: [
        // { title: "Organization", url: "/organization", icon: <Building2Icon /> },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()

  const translatedNavGroups = React.useMemo(() => {
    return data.navGroups.map((group) => ({
      group: group.group,
      items: group.items.map((item) => ({
        ...item,
        title: t(`common.${item.title.toLowerCase()}`),
      })),
    }))
  }, [t])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <Navigation navGroups={translatedNavGroups} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfile />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
