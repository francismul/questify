import { AuthServerService } from "@/lib/auth-server";
import { StudentSettingsPageClient } from "@/components/student/StudentSettingsPageClient";

export default async function StudentSettingsPage() {
  const user = await AuthServerService.requireAuth();

  return <StudentSettingsPageClient initialUser={user!} />;
}
