"use client"

import { usePathname } from "next/navigation"

import { RightSidebarTrigger } from "@/components/right-sidebar"

export function HeaderRightExtras() {
  const pathname = usePathname()
  if (pathname !== "/dashboard") return null
  return <RightSidebarTrigger className="ml-auto" />
}
