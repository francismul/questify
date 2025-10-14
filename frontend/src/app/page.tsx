import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { AuthServerService } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await AuthServerService.getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
