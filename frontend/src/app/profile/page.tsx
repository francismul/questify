import { AuthServerService } from "@/lib/auth-server";
import { redirect } from "next/navigation";

// Example server component that fetches user data and protected content
export async function UserProfile() {
  // This runs on the server, cookies are automatically available
  const user = await AuthServerService.getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  try {
    // Example: Fetch user-specific data from Django backend
    const userData = await AuthServerService.makeAuthenticatedRequest(
      "/auth/user/"
    );

    // Example: Fetch user's courses or other protected data
    // const courses = await AuthServerService.makeAuthenticatedRequest('/courses/');

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {user.first_name} {user.last_name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Level:</strong> {user.level}
          </p>
          <p>
            <strong>Total XP:</strong> {user.total_xp}
          </p>
          <p>
            <strong>Streak:</strong> {user.streak_days} days
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading user data</p>
      </div>
    );
  }
}

// Example of a protected page component
export default async function ProfilePage() {
  // This ensures the user is authenticated
  const user = await AuthServerService.requireAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.first_name}!</h1>
      <UserProfile />
    </div>
  );
}
