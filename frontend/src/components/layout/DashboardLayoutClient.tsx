"use client";

import { useState } from "react";

import { User } from "@/lib/auth-server";
import { DashboardSidebar } from "../dashboard/DashboardSidebar";
import { TopNavigation } from "../dashboard/TopNavigationServer";

interface Props {
  user?: User | null;
}

export function DashboardLayoutClient({ user }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <TopNavigation
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </>
  );
}
