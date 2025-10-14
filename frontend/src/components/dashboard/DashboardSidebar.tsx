"use client";

import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  User,
  Settings,
  Ticket,
  Award,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Reports", icon: FileText, href: "/reports" },
  { title: "Visitors", icon: Users, href: "/visitors" },
  { title: "Messages", icon: MessageSquare, href: "/messages" },
  { title: "My Profile", icon: User, href: "/profile" },
  { title: "Customise", icon: Settings, href: "/customise" },
  { title: "Vouchers", icon: Ticket, href: "/vouchers" },
  { title: "BSIP", icon: Award, href: "/bsip" },
  { title: "Campaigns", icon: Megaphone, href: "/campaigns" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const onClose = () => setIsOpen(false);

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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-sidebar rounded-full" />
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-bold text-lg">
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
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent/10",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">
            &copy; {new Date().getFullYear()} Questify
          </div>
        </div>
      </aside>
    </>
  );
}
