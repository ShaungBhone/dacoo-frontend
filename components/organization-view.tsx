"use client"

import * as React from "react"
import Link from "next/link"
import {
  BuildingIcon,
  UsersIcon,
  CreditCardIcon,
  TriangleAlertIcon,
  PlusIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  MailIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  LogOutIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useOrganization } from "@/contexts/organization-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/* -------------------------------------------------------------------------- */
/*                                   Types                                     */
/* -------------------------------------------------------------------------- */

type MemberRole = "owner" | "admin" | "member"

type Member = {
  id: string
  name: string
  email: string
  role: MemberRole
  status: "active" | "pending"
}

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
}

function initials(nameOrEmail: string): string {
  const source = nameOrEmail.trim()
  if (!source) return "?"
  const parts = source.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

/* -------------------------------------------------------------------------- */
/*                              General section                                */
/* -------------------------------------------------------------------------- */

function GeneralSection({
  name,
  slug,
  canEdit,
}: {
  name: string
  slug: string
  canEdit: boolean
}) {
  const [nameValue, setNameValue] = React.useState(name)
  const [slugValue, setSlugValue] = React.useState(slug)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    setNameValue(name)
    setSlugValue(slug)
  }, [name, slug])

  const dirty = nameValue !== name || slugValue !== slug

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    // TODO: wire to PATCH /api/v1/organizations/{id}
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2">
          <BuildingIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">General</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="grid gap-2">
          <Label htmlFor="org-name">Organization name</Label>
          <Input
            id="org-name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            disabled={!canEdit || saving}
            placeholder="Acme Inc."
          />
          <p className="text-xs text-muted-foreground">
            Displayed across the workspace and in invitations.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="org-slug">Slug</Label>
          <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring">
            <span className="pl-3 text-sm text-muted-foreground">dacoo.app/</span>
            <Input
              id="org-slug"
              value={slugValue}
              onChange={(e) =>
                setSlugValue(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-")
                )
              }
              disabled={!canEdit || saving}
              className="border-0 shadow-none focus-visible:ring-0"
              placeholder="acme"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used in URLs. Lowercase letters, numbers, and dashes only.
          </p>
        </div>

        {saved && (
          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle2Icon className="size-4 text-primary" aria-hidden="true" />
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>
              Your organization settings have been updated.
            </AlertDescription>
          </Alert>
        )}

        {canEdit && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!dirty || saving}>
              {saving ? (
                <>
                  <Spinner className="size-4" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Members section                                */
/* -------------------------------------------------------------------------- */

function InviteDialog({
  open,
  onOpenChange,
  onInvite,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: MemberRole) => void
}) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<MemberRole>("member")
  const [submitting, setSubmitting] = React.useState(false)

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit() {
    if (!valid) return
    setSubmitting(true)
    // TODO: wire to POST /api/v1/organizations/{id}/invitations
    await new Promise((resolve) => setTimeout(resolve, 600))
    onInvite(email, role)
    setSubmitting(false)
    setEmail("")
    setRole("member")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || submitting}>
            {submitting ? (
              <>
                <Spinner className="size-4" />
                Sending
              </>
            ) : (
              <>
                <MailIcon className="size-4" />
                Send invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MembersSection({
  members,
  currentUserId,
  canManage,
  onInvite,
  onRoleChange,
  onRemove,
}: {
  members: Member[]
  currentUserId: string
  canManage: boolean
  onInvite: (email: string, role: MemberRole) => void
  onRoleChange: (id: string, role: MemberRole) => void
  onRemove: (id: string) => void
}) {
  const [inviteOpen, setInviteOpen] = React.useState(false)

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">
            Members
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {members.length}
            </span>
          </CardTitle>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <PlusIcon className="size-4" />
            Invite
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {members.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No members yet</EmptyTitle>
              <EmptyDescription>
                Invite teammates to collaborate in this organization.
              </EmptyDescription>
            </EmptyHeader>
            {canManage && (
              <EmptyContent>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <PlusIcon className="size-4" />
                  Invite member
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => {
              const isSelf = member.id === currentUserId
              const isOwner = member.role === "owner"
              return (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {initials(member.name || member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {member.name || member.email}
                      </span>
                      {isSelf && (
                        <Badge variant="secondary" className="text-xs shadow-none">
                          You
                        </Badge>
                      )}
                      {member.status === "pending" && (
                        <Badge variant="outline" className="text-xs shadow-none">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {member.email}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {canManage && !isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={(v) =>
                          onRoleChange(member.id, v as MemberRole)
                        }
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={isOwner ? "default" : "secondary"}
                        className="gap-1 text-xs shadow-none"
                      >
                        {isOwner && (
                          <ShieldCheckIcon className="size-3" aria-hidden="true" />
                        )}
                        {ROLE_LABELS[member.role]}
                      </Badge>
                    )}

                    {canManage && !isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Manage ${member.name || member.email}`}
                          >
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onRemove(member.id)}
                          >
                            <Trash2Icon className="size-4" />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={onInvite}
      />
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                            Billing summary section                          */
/* -------------------------------------------------------------------------- */

function BillingSummarySection() {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <CardTitle className="text-base">Billing</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current plan</span>
            <Badge variant="secondary" className="shadow-none">
              Basic
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your plan, credits, and invoices from the billing page.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/billing">
            View billing
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Danger zone section                            */
/* -------------------------------------------------------------------------- */

function DangerZoneSection({
  organizationName,
  isOwner,
}: {
  organizationName: string
  isOwner: boolean
}) {
  const [leaveOpen, setLeaveOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [working, setWorking] = React.useState(false)

  async function handleConfirm(kind: "leave" | "delete") {
    setWorking(true)
    // TODO: wire to DELETE /api/v1/organizations/{id} or leave endpoint
    await new Promise((resolve) => setTimeout(resolve, 700))
    setWorking(false)
    setLeaveOpen(false)
    setDeleteOpen(false)
    setConfirmText("")
  }

  return (
    <Card className="border border-destructive/30 shadow-none">
      <CardHeader className="border-b border-destructive/20">
        <div className="flex items-center gap-2">
          <TriangleAlertIcon className="size-4 text-destructive" aria-hidden="true" />
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 p-0">
        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Leave organization</span>
            <p className="text-sm text-muted-foreground">
              You will lose access to this organization&apos;s resources.
            </p>
          </div>
          <Button variant="outline" onClick={() => setLeaveOpen(true)}>
            <LogOutIcon className="size-4" />
            Leave
          </Button>
        </div>

        {isOwner && (
          <>
            <Separator />
            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Delete organization</span>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this organization and all of its data.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Leave confirmation */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave organization?</DialogTitle>
            <DialogDescription>
              You&apos;ll be removed from {organizationName} and lose access to
              its resources. You can rejoin if invited again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirm("leave")}
              disabled={working}
            >
              {working ? (
                <>
                  <Spinner className="size-4" />
                  Leaving
                </>
              ) : (
                "Leave organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete organization?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {organizationName} and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-semibold">{organizationName}</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={organizationName}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirm("delete")}
              disabled={working || confirmText !== organizationName}
            >
              {working ? (
                <>
                  <Spinner className="size-4" />
                  Deleting
                </>
              ) : (
                "Delete organization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Main view                                    */
/* -------------------------------------------------------------------------- */

export function OrganizationView() {
  const { user } = useAuth()
  const { activeOrganization } = useOrganization()

  const isOwner =
    !!user && !!activeOrganization && activeOrganization.owner_id === user.id
  const canManage = isOwner

  // Seed a members list. Backend wiring pending — start with the current user.
  const [members, setMembers] = React.useState<Member[]>([])

  React.useEffect(() => {
    if (!user) return
    setMembers([
      {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: isOwner ? "owner" : "member",
        status: "active",
      },
    ])
  }, [user, isOwner])

  function handleInvite(email: string, role: MemberRole) {
    setMembers((prev) => [
      ...prev,
      {
        id: `invite-${Date.now()}`,
        name: "",
        email,
        role,
        status: "pending",
      },
    ])
  }

  function handleRoleChange(id: string, role: MemberRole) {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    )
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!activeOrganization) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BuildingIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No organization selected</EmptyTitle>
            <EmptyDescription>
              Select or create an organization from the workspace switcher to
              manage its settings.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Organization settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage {activeOrganization.name}&apos;s profile, members, and
          preferences.
        </p>
      </header>

      <GeneralSection
        name={activeOrganization.name}
        slug={activeOrganization.slug}
        canEdit={canManage}
      />

      <MembersSection
        members={members}
        currentUserId={String(user.id)}
        canManage={canManage}
        onInvite={handleInvite}
        onRoleChange={handleRoleChange}
        onRemove={handleRemove}
      />

      <BillingSummarySection />

      <DangerZoneSection
        organizationName={activeOrganization.name}
        isOwner={isOwner}
      />
    </div>
  )
}
