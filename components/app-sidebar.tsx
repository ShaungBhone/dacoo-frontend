"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BookOpenIcon,
  DatabaseIcon,
  FlaskConicalIcon,
  ActivityIcon,
  BotIcon,
} from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    { title: "Playground", url: "/dashboard", icon: <TerminalSquareIcon /> },
    { title: "Agents", url: "/agents", icon: <BotIcon /> },
    { title: "Datasets", url: "/datasets", icon: <DatabaseIcon /> },
    // { title: "Experiments", url: "/experiments", icon: <FlaskConicalIcon /> },
    { title: "Activity", url: "/activity", icon: <ActivityIcon /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useAuth()

  const teams = React.useMemo(() => {
    if (isLoading && !user) return []
    if (!user?.organizations || user.organizations.length === 0) {
      return [
        {
          name: "Personal Workspace",
          logo: <GalleryVerticalEndIcon />,
          plan: "Free",
        },
      ]
    }
    return user.organizations.map((org, index) => {
      const Logos = [GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon]
      const LogoIcon = Logos[index % Logos.length]
      return {
        name: org.name,
        logo: <LogoIcon />,
        plan: org.owner_id === user.id ? "Owner" : "Member",
      }
    })
  }, [user, isLoading])

  const sidebarUser = React.useMemo(() => {
    return {
      name: user?.name || "User",
      email: user?.email || "",
      avatar: `https://avatar.vercel.sh/${user?.email || "user"}.png`,
    }
  }, [user])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
