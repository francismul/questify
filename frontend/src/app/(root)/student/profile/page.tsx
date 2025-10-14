import { AuthServerService } from "@/lib/auth-server";
import { StudentProfilePageClient } from "@/components/student/StudentProfilePageClient";

export default async function StudentProfilePage() {
  const user = await AuthServerService.requireAuth();

  return <StudentProfilePageClient initialUser={user!} />;
}
