"use client";

import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  User,
  Settings,
  Award,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSidebar } from "./SidebarProvider";
import { useTranslation } from "react-i18next";

const teacherMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
  { title: "My Courses", icon: BookOpen, href: "/teacher/courses" },
  { title: "Students", icon: Users, href: "/teacher/students" },
  { title: "Reports", icon: FileText, href: "/teacher/reports" },
  { title: "Analytics", icon: BarChart3, href: "/teacher/analytics" },
  { title: "Messages", icon: MessageSquare, href: "/teacher/messages" },
  { title: "Achievements", icon: Award, href: "/teacher/achievements" },
  { title: "Campaigns", icon: Megaphone, href: "/teacher/campaigns" },
  { title: "My Profile", icon: User, href: "/teacher/profile" },
  { title: "Settings", icon: Settings, href: "/teacher/settings" },
];

export function TeacherDashboardSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useTranslation("common");

  const teacherMenuItems = [
    {
      title: t("dashboard"),
      icon: LayoutDashboard,
      href: "/teacher/dashboard",
    },
    { title: t("myCourses"), icon: BookOpen, href: "/teacher/courses" },
    { title: t("students"), icon: Users, href: "/teacher/students" },
    { title: t("reports"), icon: FileText, href: "/teacher/reports" },
    { title: t("analytics"), icon: BarChart3, href: "/teacher/analytics" },
    { title: t("messages"), icon: MessageSquare, href: "/teacher/messages" },
    { title: t("achievements"), icon: Award, href: "/teacher/achievements" },
    { title: t("campaigns"), icon: Megaphone, href: "/teacher/campaigns" },
    { title: t("myProfile"), icon: User, href: "/teacher/profile" },
    { title: t("settings"), icon: Settings, href: "/teacher/settings" },
  ];

  const onClose = () => toggle();
  const toggleCollapsed = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "teacher-sidebar-collapsed",
        newCollapsed.toString()
      );
    }
  };

  // Load collapsed state from localStorage after hydration
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("teacher-sidebar-collapsed");
    if (storedCollapsed === "true") {
      setIsCollapsed(true);
    }
  }, []);

  // Track online/offline status
  useEffect(() => {
    // Set initial status
    setIsOnline(navigator.onLine);

    // Add event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300",
          "lg:translate-x-0", // Always visible on desktop
          isOpen ? "translate-x-0 bg-background" : "-translate-x-full", // Mobile behavior
          isCollapsed ? "w-16" : "w-64" // Collapsed width on desktop
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
              <div className="w-4 h-4 bg-sidebar rounded-full" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sidebar-foreground font-bold text-lg truncate">
                  Questify
                </h1>
                <p
                  className={cn(
                    "text-xs flex items-center gap-1",
                    isOnline ? "text-green-400" : "text-red-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isOnline ? "bg-green-400" : "bg-red-400"
                    )}
                  />
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}>
          <ul className="space-y-2">
            {teacherMenuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                      "hover:bg-sidebar-accent/10",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                      isCollapsed && "justify-center px-4"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar-accent text-sidebar-accent-foreground text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="text-xs text-sidebar-foreground/60 truncate">
                &copy; {new Date().getFullYear()} Questify
              </div>
            )}
            <button
              onClick={toggleCollapsed}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleCollapsed();
                }
              }}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent/10 text-sidebar-foreground/60 hover:text-sidebar-foreground",
                "focus:outline-none focus:ring-2 focus:ring-sidebar-accent/50",
                isCollapsed && "mx-auto"
              )}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
