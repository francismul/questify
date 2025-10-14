import { AuthServerService } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    first_name: string;
    last_name: string;
  };
  difficulty_level: string;
  estimated_hours: number;
  is_published: boolean;
}

// Server component that fetches courses from Django backend
export async function CoursesList() {
  const user = await AuthServerService.getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  try {
    // Fetch courses data using authenticated request
    const courses = await AuthServerService.makeAuthenticatedRequest<Course[]>('/courses/');
    
    if (!courses || courses.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No courses available yet.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p><strong>Instructor:</strong> {course.instructor.first_name} {course.instructor.last_name}</p>
              <p><strong>Difficulty:</strong> {course.difficulty_level}</p>
              <p><strong>Duration:</strong> {course.estimated_hours} hours</p>
              <p><strong>Status:</strong> {course.is_published ? 'Published' : 'Draft'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching courses:', error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading courses data</p>
      </div>
    );
  }
}

// Server component for teacher dashboard
export async function TeacherCourses() {
  const user = await AuthServerService.getCurrentUser();
  
  if (!user || user.role !== 'teacher') {
    redirect('/auth/login');
  }

  try {
    // Fetch teacher-specific data
    const dashboardData = await AuthServerService.makeAuthenticatedRequest('/teacher/dashboard/');
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        {/* Render teacher dashboard data */}
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading teacher dashboard</p>
      </div>
    );
  }
}