import { AuthServerService } from "@/lib/auth-server";
import { TeacherSettingsPageClient } from "@/components/teacher/TeacherSettingsPageClient";

export default async function TeacherSettingsPage() {
  const user = await AuthServerService.requireAuth();

  return <TeacherSettingsPageClient initialUser={user!} />;
}
