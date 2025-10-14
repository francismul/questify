"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Server Actions for Authentication (Next.js 14+ App Router)
 *
 * This file contains server actions for handling authentication:
 * - loginAction: Authenticate user and set auth cookies
 * - registerAction: Register new user and set auth cookies
 * - logoutAction: Clear auth cookies and redirect to login
 *
 * These actions can be called directly from forms and client components
 * without needing API routes.
 */

// Types
interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    role: "student" | "teacher";
    avatar?: string;
    total_xp: number;
    level: number;
    streak_days: number;
    created_at: string;
    updated_at: string;
  };
}

export interface CourseResponse {
  completed: any;
  id: string;
  title: string;
  description: string;
  teacher: string;
  teacher_id: string;
  teacher_name: string;
  thumbnail?: string;
  color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  enrolled_students: string[];
  enrollment_count: number;
  rating?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  progress?: number; // Progress percentage for enrolled courses
  average_score?: number; // Average quiz score for enrolled courses
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  enrolled_at?: string;
  progress?: number;
  completed?: boolean;
  average_score?: number;
  courses?: string[];
}

export interface ChapterResponse {
  id: string;
  course: string;
  title: string;
  content: string;
  order: number;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
  quiz?: QuizResponse;
  duration?: string;
}

export interface QuizResponse {
  id: string;
  title: string;
  description: string;
  course: string;
  chapter?: string;
  time_limit?: number;
  passing_score: number;
  max_attempts: number;
  type: "chapter" | "final";
  created_at: string;
  updated_at: string;
  questions?: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  quiz: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correct_answer: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentRequestResponse {
  id: string;
  student: string;
  student_name: string;
  student_email: string;
  course: string;
  course_title: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
}

export interface ChapterData {
  title: string;
  content: string;
  order: number;
  estimated_minutes: number;
}

export interface QuizData {
  title: string;
  description: string;
  chapter?: string;
  time_limit?: number;
  passing_score: number;
  max_attempts: number;
  type: "chapter" | "final";
}

export interface QuestionData {
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correct_answer: number;
  explanation: string;
  points: number;
  order: number;
}

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Helper function to set auth cookies
async function setAuthCookies(authData: AuthResponse, rememberMe: boolean = false) {
  const cookieStore = await cookies();

  cookieStore.set("questify_access_token", authData.access, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60, // 1 hour
  });

  // Set refresh token expiration based on remember me
  const refreshTokenMaxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day

  cookieStore.set("questify_refresh_token", authData.refresh, {
    ...COOKIE_CONFIG,
    maxAge: refreshTokenMaxAge,
  });

  cookieStore.set("questify_user_data", JSON.stringify(authData.user), {
    ...COOKIE_CONFIG,
    maxAge: refreshTokenMaxAge, // Same as refresh token
  });
}

// Helper function to clear auth cookies
async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("questify_access_token");
  cookieStore.delete("questify_refresh_token");
  cookieStore.delete("questify_user_data");
}

// Server actions for authentication
export async function loginAction(
  email: string,
  password: string,
  rememberMe?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Login failed",
      };
    }

    // Set cookies using helper function
    await setAuthCookies(data, rememberMe);

    // Revalidate any cached auth data
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function registerAction(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "student" | "teacher" = "student"
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Registration failed",
      };
    }

    // Set cookies using helper function (default to not remember for new registrations)
    await setAuthCookies(data, false);

    // Revalidate any cached auth data
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Registration action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  try {
    const accessToken = cookieStore.get("questify_access_token")?.value;
    const refreshToken = cookieStore.get("questify_refresh_token")?.value;

    // Call Django backend logout if we have tokens
    if (refreshToken && accessToken) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } catch (error) {
    console.error("Logout action error:", error);
    // Continue with logout even if API call fails
  } finally {
    // Always clear cookies using helper function
    await clearAuthCookies();
  }

  // Revalidate and redirect
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// Course Management Actions

export interface CourseData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  color?: string;
  thumbnail?: string;
  tags?: string[];
}

export async function getTeacherCourses(): Promise<CourseResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    throw error;
  }
}

export async function createCourse(
  courseData: CourseData
): Promise<CourseResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    // Check if we have a file upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasFile = courseData.thumbnail ? (courseData.thumbnail as any) instanceof File : false;

    let response: Response;
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('difficulty', courseData.difficulty);
      formData.append('estimated_hours', courseData.estimated_hours.toString());
      if (courseData.color) formData.append('color', courseData.color);
      if (hasFile && courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      if (courseData.tags) formData.append('tags', JSON.stringify(courseData.tags));

      response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
    } else {
      // Use JSON for non-file data
      const requestData = {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        estimated_hours: courseData.estimated_hours,
        color: courseData.color,
        thumbnail: courseData.thumbnail,
        tags: courseData.tags,
      };

      response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to create course: ${response.status}`
      );
    }

    const data = await response.json();
    revalidatePath("/teacher/dashboard", "page");
    revalidatePath("/teacher/courses", "page");
    return data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function updateCourse(
  courseId: string,
  courseData: Partial<CourseData>
): Promise<CourseResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    // Check if we have a file upload for thumbnail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasFile = courseData.thumbnail ? (courseData.thumbnail as any) instanceof File : false;

    let response: Response;
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('title', courseData.title || '');
      formData.append('description', courseData.description || '');
      formData.append('difficulty', courseData.difficulty || 'beginner');
      formData.append('estimated_hours', (courseData.estimated_hours || 10).toString());
      if (courseData.color) formData.append('color', courseData.color);
      if (hasFile && courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      if (courseData.tags) formData.append('tags', JSON.stringify(courseData.tags));

      response = await fetch(
        `${API_BASE_URL}/api/v1/courses/${courseId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );
    } else {
      // Use JSON for non-file data, exclude thumbnail if it's a string (existing URL)
      const requestData: any = {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        estimated_hours: courseData.estimated_hours,
        color: courseData.color,
        tags: courseData.tags,
      };

      // Only include thumbnail if it's not a string (existing URL)
      if (courseData.thumbnail && typeof courseData.thumbnail !== 'string') {
        requestData.thumbnail = courseData.thumbnail;
      }

      response = await fetch(
        `${API_BASE_URL}/api/v1/courses/${courseId}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to update course: ${response.status}`
      );
    }

    const data = await response.json();
    revalidatePath("/teacher/dashboard", "page");
    revalidatePath("/teacher/courses", "page");
    return data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/courses/${courseId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to delete course: ${response.status}`
      );
    }

    revalidatePath("/teacher/dashboard", "page");
    revalidatePath("/teacher/courses", "page");
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

// Student Course Management Actions

export async function getAvailableCourses(): Promise<CourseResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/available/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch available courses: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching available courses:", error);
    throw error;
  }
}

export async function requestCourseEnrollment(courseId: string): Promise<{ message: string; request_id: string; status: string }> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/enroll/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to request course enrollment: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error requesting course enrollment:", error);
    throw error;
  }
}

export async function getCourseEnrollmentRequests(courseId: string): Promise<EnrollmentRequestResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/enrollment_requests/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrollment requests: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching enrollment requests:", error);
    throw error;
  }
}

export async function approveEnrollmentRequest(requestId: string): Promise<{ message: string }> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/enrollment-requests/approve/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request_id: requestId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to approve enrollment: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error approving enrollment request:", error);
    throw error;
  }
}

export async function rejectEnrollmentRequest(requestId: string): Promise<{ message: string }> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/enrollment-requests/reject/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request_id: requestId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to reject enrollment: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error rejecting enrollment request:", error);
    throw error;
  }
}

export async function getAllEnrollmentRequests(): Promise<EnrollmentRequestResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/enrollment-requests/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrollment requests: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching enrollment requests:", error);
    throw error;
  }
}

export async function getCourseStudents(courseId: string): Promise<StudentData[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/students/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch course students: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching course students:", error);
    throw error;
  }
}

export async function dismissStudentFromCourse(courseId: string, studentId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/dismiss_student/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ student_id: studentId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to dismiss student: ${response.status}`);
    }
  } catch (error) {
    console.error("Error dismissing student:", error);
    throw error;
  }
}

export async function getAllTeacherStudents(): Promise<StudentData[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    // First get all teacher courses
    const courses = await getTeacherCourses();

    // Then get students from all courses
    const allStudents: StudentData[] = [];
    const studentMap = new Map<string, StudentData>();

    for (const course of courses) {
      try {
        const courseStudents = await getCourseStudents(course.id);
        courseStudents.forEach(student => {
          if (!studentMap.has(student.id)) {
            studentMap.set(student.id, {
              ...student,
              courses: [course.title],
            });
          } else {
            const existingStudent = studentMap.get(student.id)!;
            existingStudent.courses!.push(course.title);
          }
        });
      } catch (error) {
        console.error(`Error fetching students for course ${course.title}:`, error);
      }
    }

    return Array.from(studentMap.values());
  } catch (error) {
    console.error("Error fetching all teacher students:", error);
    throw error;
  }
}

export async function getStudentCourses(): Promise<CourseResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/enrolled/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrolled courses: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
}

// Chapter Management Actions

export async function getCourseChapters(courseId: string): Promise<ChapterResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chapters/?course=${courseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
}

export async function createChapter(courseId: string, chapterData: ChapterData): Promise<ChapterResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chapters/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course: courseId,
        ...chapterData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create chapter: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating chapter:", error);
    throw error;
  }
}

export async function updateChapter(chapterId: string, chapterData: Partial<ChapterData>): Promise<ChapterResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chapters/${chapterId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chapterData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update chapter: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating chapter:", error);
    throw error;
  }
}

export async function deleteChapter(chapterId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/chapters/${chapterId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete chapter: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
}

// Quiz Management Actions

export async function getCourseQuizzes(courseId: string): Promise<QuizResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/?course=${courseId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch quizzes: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
}

export async function createQuiz(courseId: string, quizData: QuizData): Promise<QuizResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        course: courseId,
        ...quizData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create quiz: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
}

export async function updateQuiz(quizId: string, quizData: Partial<QuizData>): Promise<QuizResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/${quizId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update quiz: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
}

export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/quizzes/${quizId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete quiz: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
}

// Question Management Actions

export async function getQuizQuestions(quizId: string): Promise<QuestionResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/questions/?quiz=${quizId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

export async function createQuestion(quizId: string, questionData: QuestionData): Promise<QuestionResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/questions/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quiz: quizId,
        ...questionData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create question: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

export async function updateQuestion(questionId: string, questionData: Partial<QuestionData>): Promise<QuestionResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${questionId}/`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update question: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/questions/${questionId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete question: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}
