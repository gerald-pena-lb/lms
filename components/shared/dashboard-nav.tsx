import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Users,
  School,
  ClipboardList,
  BarChart3,
  Settings,
  Award,
  Calendar,
  FileText,
  Presentation,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/database";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navigationConfig: Record<UserRole, NavItem[]> = {
  student: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "My Classes", href: "/student/classes", icon: BookOpen },
    { title: "Activities", href: "/student/activities", icon: ClipboardList },
    { title: "Assignments", href: "/student/assignments", icon: FileText },
    { title: "Progress", href: "/student/progress", icon: BarChart3 },
    { title: "Certificates", href: "/student/certificates", icon: Award },
  ],
  teacher: [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "My Classes", href: "/teacher/classes", icon: BookOpen },
    { title: "Teaching Mode", href: "/teacher/teaching-mode", icon: Presentation },
    { title: "Attendance", href: "/teacher/attendance", icon: Calendar },
    { title: "Student Progress", href: "/teacher/progress", icon: BarChart3 },
    { title: "Assignments", href: "/teacher/assignments", icon: FileText },
  ],
  supervisor: [
    { title: "Dashboard", href: "/supervisor", icon: LayoutDashboard },
    { title: "Courses", href: "/supervisor/courses", icon: BookOpen },
    { title: "Activities", href: "/supervisor/activities", icon: ClipboardList },
    { title: "Teachers", href: "/supervisor/teachers", icon: GraduationCap },
    { title: "Schools", href: "/supervisor/schools", icon: School },
    { title: "Reports", href: "/supervisor/reports", icon: BarChart3 },
    { title: "Content Approval", href: "/supervisor/approval", icon: CheckSquare },
  ],
  admin: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Schools", href: "/admin/schools", icon: School },
    { title: "Courses", href: "/admin/courses", icon: BookOpen },
    { title: "Activities", href: "/admin/activities", icon: ClipboardList },
    { title: "Reports", href: "/admin/reports", icon: BarChart3 },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
};
