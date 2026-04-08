"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { navigationConfig, type NavItem } from "@/components/shared/dashboard-nav";
import type { UserRole } from "@/types/database";

function getNavItems(pathname: string): { role: UserRole; items: NavItem[] } {
  if (pathname.startsWith("/admin")) return { role: "admin", items: navigationConfig.admin };
  if (pathname.startsWith("/supervisor")) return { role: "supervisor", items: navigationConfig.supervisor };
  if (pathname.startsWith("/teacher")) return { role: "teacher", items: navigationConfig.teacher };
  return { role: "student", items: navigationConfig.student };
}

const roleLabels: Record<UserRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  supervisor: "Supervisor Portal",
  admin: "Admin Portal",
};

interface AppSidebarProps {
  user?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const { role, items } = getNavItems(pathname);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${role}`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">LMS</span>
                  <span className="text-xs text-muted-foreground">{roleLabels[role]}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name} />
                <AvatarFallback>
                  {user.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-sm font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Separator />
          </>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
