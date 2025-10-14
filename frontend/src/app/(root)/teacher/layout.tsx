import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { AuthServerService } from "@/lib/auth-server";

interface Props {
  children: ReactNode;
}

export default async function Layout({ children }: Props) {
  const user = await AuthServerService.requireAuth();

  if (!user) {
    redirect("/auth/login");
  }

  // Ensure only teachers can access this page
  if (user.role !== "teacher") {
    redirect("/dashboard"); // Redirect to role-based dispatcher
  }

  return <>{children}</>;
}
