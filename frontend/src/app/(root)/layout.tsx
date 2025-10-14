import { StudentDashboardSidebar } from "@/components/dashboard/StudentDashboardSidebar";
import { TeacherDashboardSidebar } from "@/components/dashboard/TeacherDashboardSidebar";
import { TopNavigation } from "@/components/dashboard/TopNavigationServer";
import { AuthServerService } from "@/lib/auth-server";
import { Suspense } from "react";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  const user = await AuthServerService.getCurrentUser();

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          {user?.role === "teacher" ? (
            <TeacherDashboardSidebar />
          ) : (
            <StudentDashboardSidebar />
          )}

          <div className="flex flex-1 flex-col">
            <TopNavigation user={user} />

            {children}
          </div>
        </div>
      </SidebarProvider>
    </Suspense>
  );
}
