"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Home,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  FileText,
  Calendar,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession, signOut } from "next-auth/react"

const menuItems = [
  {
    title: "Vue d'ensemble",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Offres d'emploi",
    url: "/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Candidatures",
    url: "/admin/applications",
    icon: Users,
  },
  {
    title: "Statistiques",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
  },
]

const managementItems = [
  {
    title: "Paramètres",
    url: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Rapports",
    url: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Calendrier",
    url: "/admin/calendar",
    icon: Calendar,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [counts, setCounts] = useState({
    pendingApplications: 0,
    totalNotifications: 0,
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
        const data = await response.json()
        setCounts({
          pendingApplications: data.overview?.pending_applications || 0,
          totalNotifications: data.overview?.total_notifications || 0,
        })
        }
      } catch (error) {
        console.error('Error fetching sidebar counts:', error)
      }
    }

    fetchCounts()
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" })
  }

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-teal-100">
      <SidebarHeader className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white border-b border-teal-500/20">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg"></div>
            <div className="relative flex aspect-square size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Shield className="size-5 text-white" />
            </div>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-lg">Panneau d'administration</span>
            <span className="truncate text-xs text-teal-100 opacity-90">
              Plateforme d'emploi
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-slate-50 to-gray-50">
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:shadow-sm"
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          pathname === item.url
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600'
                        }`}>
                          <item.icon className="size-4" />
                        </div>
                        <span className={`font-medium transition-colors ${
                          pathname === item.url ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.title === "Candidatures" && counts.pendingApplications > 0 && (
                          <Badge variant="destructive" className="text-xs px-2 py-0.5 bg-red-500 hover:bg-red-600">
                            {counts.pendingApplications}
                          </Badge>
                        )}
                        {item.title === "Notifications" && counts.totalNotifications > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white">
                            {counts.totalNotifications}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3 px-3">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm"
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        pathname === item.url
                          ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-700'
                      }`}>
                        <item.icon className="size-4" />
                      </div>
                      <span className={`font-medium transition-colors ${
                        pathname === item.url ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-t from-slate-100 to-slate-50 border-t border-slate-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg mx-3 mb-3 bg-white shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <Avatar className="h-9 w-9 ring-2 ring-teal-100">
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                <span className="truncate font-semibold text-slate-900">
                  {session?.user?.name || "Admin"}
                </span>
                <span className="truncate text-xs text-slate-500">
                  {session?.user?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
