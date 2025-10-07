export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "teacher";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: "student";
  enrolledCourses: string[];
  completedCourses: string[];
  totalXP: number;
  level: number;
  streakDays: number;
}

export interface Teacher extends User {
  role: "teacher";
  createdCourses: string[];
  studentsCount: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  thumbnail?: string;
  instructor?: string; // For display purposes
  duration?: string; // e.g., "4 weeks"
  enrollmentCount?: number;
  rating?: number; // Average rating out of 5
  color: string; // For the course node color in timeline
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  chapters: Chapter[];
  finalExam: Quiz;
  enrolledStudents: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  completed: boolean;
  duration?: string;
  estimatedMinutes?: number;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  attempts: number; // how many attempts allowed
  type: "chapter" | "final";
}

export interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points: number;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedChapters: string[];
  chapterScores: Record<string, number>; // chapterId -> score percentage
  finalExamScore?: number;
  finalExamAttempts: number;
  totalTimeSpent: number; // in minutes
  lastAccessedAt: string;
  completed: boolean;
  completedAt?: string;
  certificateUrl?: string;
}

export interface FloatingHubMenu {
  isOpen: boolean;
  activeSection: "courses" | "progress" | "community" | "settings" | null;
}

export interface TimelineNode {
  course: Course;
  progress: StudentProgress;
  position: { x: number; y: number };
  isActive: boolean;
  isCompleted: boolean;
  glowIntensity: number;
}

export interface LearningGalaxy {
  centerAvatar: User;
  orbitingCourses: CompletedCourse[];
  totalXP: number;
  level: number;
}

export interface CompletedCourse {
  course: Course;
  completedAt: string;
  score: number;
  position: { x: number; y: number; z: number }; // 3D position for orbital effect
  orbitSpeed: number;
}

// Animation and UI States
export interface AnimationState {
  isLoading: boolean;
  currentAnimation: string | null;
  backgroundGradient: string;
  particleCount: number;
}

export interface UIPreferences {
  theme: "light" | "dark" | "auto";
  reducedMotion: boolean;
  soundEnabled: boolean;
  fontSize: "small" | "medium" | "large";
}
