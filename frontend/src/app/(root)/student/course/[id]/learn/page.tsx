"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Lock, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CourseReader } from "@/components/course/CourseReader";
import { QuizModal } from "@/components/course/QuizModal";
import { Course, StudentProgress } from "@/types";
import { cn } from "@/lib/utils";

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showReader, setShowReader] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chapterCompleted, setChapterCompleted] = useState<Set<string>>(new Set());

  const fetchCourseData = useCallback(async () => {
    try {
      // TODO: Replace with actual API calls
      // For now, using sample data
      const courseData = await getCourseData(courseId);
      const progressData = await getStudentProgress(courseId);

      setCourse(courseData);
      setProgress(progressData);
      if (progressData && progressData.completedChapters.length > 0) {
        const lastCompletedIndex = courseData.chapters.findIndex(
          ch => progressData.completedChapters.includes(ch.id)
        );
        setCurrentChapterIndex(Math.min(lastCompletedIndex + 1, courseData.chapters.length - 1));
      }

      // Mark completed chapters
      const completedSet = new Set(progressData?.completedChapters || []);
      setChapterCompleted(completedSet);

    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Mock API functions - replace with actual API calls
  const getCourseData = async (id: string): Promise<Course> => {
    // This should be replaced with actual API call
    return {
      id,
      title: "Sample Course",
      description: "A sample course for learning",
      teacherId: "teacher1",
      teacherName: "Dr. Smith",
      thumbnail: "",
      instructor: "Dr. Smith",
      duration: "4 weeks",
      enrollmentCount: 100,
      rating: 4.5,
      color: "#3b82f6",
      difficulty: "beginner",
      estimatedHours: 20,
      chapters: [
        {
          id: "ch1",
          title: "Introduction to the Course",
          content: "Welcome to this course! In this chapter, we'll cover the basics...",
          order: 1,
          completed: false,
          duration: "30 min",
          estimatedMinutes: 30,
          quiz: {
            id: "quiz1",
            title: "Chapter 1 Quiz",
            description: "Test your understanding of the introduction",
            questions: [
              {
                id: "q1",
                question: "What is the main topic of this course?",
                type: "multiple-choice",
                options: ["Programming", "Design", "Data Science", "Sample Topic"],
                correctAnswer: 3,
                explanation: "This is a sample course covering various topics.",
                points: 10,
              },
            ],
            timeLimit: 300,
            passingScore: 70,
            attempts: 3,
            type: "chapter",
          },
        },
        {
          id: "ch2",
          title: "Advanced Concepts",
          content: "Now that you understand the basics, let's dive deeper...",
          order: 2,
          completed: false,
          duration: "45 min",
          estimatedMinutes: 45,
          quiz: {
            id: "quiz2",
            title: "Chapter 2 Quiz",
            description: "Test your understanding of advanced concepts",
            questions: [
              {
                id: "q2",
                question: "What is an advanced concept?",
                type: "multiple-choice",
                options: ["Basic idea", "Complex topic", "Simple explanation", "Easy task"],
                correctAnswer: 1,
                explanation: "Advanced concepts are more complex and require deeper understanding.",
                points: 10,
              },
            ],
            timeLimit: 300,
            passingScore: 70,
            attempts: 3,
            type: "chapter",
          },
        },
      ],
      finalExam: {
        id: "final",
        title: "Final Exam",
        description: "Comprehensive test of all course material",
        questions: [],
        timeLimit: 600,
        passingScore: 80,
        attempts: 1,
        type: "final",
      },
      enrolledStudents: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const getStudentProgress = async (courseId: string): Promise<StudentProgress> => {
    // This should be replaced with actual API call
    return {
      studentId: "student1",
      courseId,
      enrolledAt: new Date().toISOString(),
      completedChapters: [],
      chapterScores: {},
      finalExamAttempts: 0,
      totalTimeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      completed: false,
    };
  };

  const handleStartChapter = (chapterIndex: number) => {
    if (chapterIndex > 0 && !chapterCompleted.has(course!.chapters[chapterIndex - 1].id)) {
      return; // Can't start next chapter if previous isn't completed
    }
    setCurrentChapterIndex(chapterIndex);
    setShowReader(true);
  };

  const handleChapterComplete = async (chapterId: string) => {
    setShowReader(false);
    setShowQuiz(true);
  };

  const handleQuizComplete = async (score: number) => {
    if (!course) return;

    const currentChapter = course.chapters[currentChapterIndex];
    const passed = score >= (currentChapter.quiz?.passingScore || 70);

    if (passed) {
      // Mark chapter as completed
      const newCompleted = new Set(chapterCompleted);
      newCompleted.add(currentChapter.id);
      setChapterCompleted(newCompleted);

      // Save progress to backend
      await saveProgress(currentChapter.id, score);

      // Move to next chapter or show completion
      if (currentChapterIndex < course.chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
      } else {
        // Course completed
        alert("Congratulations! You've completed the course!");
      }
    } else {
      alert(`You need to score at least ${currentChapter.quiz?.passingScore || 70}% to proceed. Try again!`);
    }

    setShowQuiz(false);
  };

  const saveProgress = async (_chapterId: string, score: number) => {
    // TODO: Implement actual API call to save progress
    console.log(`Saving progress: Chapter ${_chapterId}, Score: ${score}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Button onClick={() => router.push("/student/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const currentChapter = course.chapters[currentChapterIndex];
  const progressPercentage = course.chapters.length > 0
    ? (chapterCompleted.size / course.chapters.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/student/courses")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Chapter {currentChapterIndex + 1} of {course.chapters.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-lg font-bold">{Math.round(progressPercentage)}%</p>
              </div>
              <div className="w-24 bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Chapter List */}
        <div className="grid gap-4 mb-8">
          {course.chapters.map((chapter, index) => {
            const isCompleted = chapterCompleted.has(chapter.id);
            const isCurrent = index === currentChapterIndex;
            const isLocked = index > 0 && !chapterCompleted.has(course.chapters[index - 1].id);
            const canAccess = index === 0 || chapterCompleted.has(course.chapters[index - 1].id);

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-6 rounded-lg border transition-all duration-200",
                  isCompleted
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    : isCurrent
                    ? "bg-primary/5 border-primary"
                    : isLocked
                    ? "bg-muted/50 border-muted opacity-60"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted text-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{chapter.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {chapter.duration} • {chapter.estimatedMinutes} min read
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                    <Button
                      onClick={() => handleStartChapter(index)}
                      disabled={!canAccess}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                    >
                      {isCompleted ? "Review" : isCurrent ? "Continue" : "Start"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Course Completion */}
        {chapterCompleted.size === course.chapters.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20"
          >
            <Award className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-6">
              You&apos;ve completed all chapters of this course.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowQuiz(true)}>
                Take Final Exam
              </Button>
              <Button variant="outline" onClick={() => router.push("/student/courses")}>
                Back to Courses
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Course Reader Modal */}
      <AnimatePresence>
        {showReader && currentChapter && (
          <CourseReader
            course={course}
            currentChapter={currentChapter}
            chapters={course.chapters}
            onChapterChange={(chapter) => {
              const index = course.chapters.findIndex(ch => ch.id === chapter.id);
              setCurrentChapterIndex(index);
            }}
            onClose={() => setShowReader(false)}
            onChapterComplete={handleChapterComplete}
          />
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuiz && currentChapter?.quiz && (
          <QuizModal
            quiz={currentChapter.quiz}
            isOpen={showQuiz}
            onClose={() => setShowQuiz(false)}
            onComplete={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}