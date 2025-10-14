import { AuthServerService } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await AuthServerService.requireAuth();

  if (!user) {
    redirect("/auth/login");
  }

  // Redirect to appropriate dashboard based on role
  if (user.role === "teacher") {
    redirect("/teacher/dashboard");
  } else {
    // For students, we need to create a student dashboard route
    // For now, redirect to a generic dashboard or create one
    redirect("/student/dashboard");
  }
}