import { AuthServerService } from "@/lib/auth-server";
import { TeacherProfilePageClient } from "@/components/teacher/TeacherProfilePageClient";

export default async function TeacherProfilePage() {
  const user = await AuthServerService.requireAuth();

  return <TeacherProfilePageClient initialUser={user!} />;
}
