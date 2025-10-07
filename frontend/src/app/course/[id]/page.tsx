"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, BookOpen, Award } from "lucide-react";
import { CourseReader } from "@/components/course/CourseReader";
import { QuizModal } from "@/components/course/QuizModal";
import { Button } from "@/components/ui/Button";
import { Course, Chapter, Quiz } from "@/types";
import { cn } from "@/lib/utils";

const newsampleQuiz: Quiz = {
  title: "",
  id: "",
  questions: [],
  attempts: 2,
  passingScore: 20,
  type: "chapter",
};

// Sample course data with chapters and quizzes
const sampleCourse: Course = {
  id: "1",
  title: "Introduction to Modern Web Development",
  description:
    "Learn the fundamentals of building modern web applications with React, TypeScript, and Next.js",
  instructor: "Dr. Sarah Chen",
  duration: "4 weeks",
  difficulty: "beginner",
  tags: ["React", "TypeScript", "Next.js", "Web Development"],
  thumbnail: "",
  enrollmentCount: 1234,
  rating: 4.8,
  chapters: [],
  teacherId: "",
  teacherName: "",
  color: "",
  estimatedHours: 0,
  finalExam: newsampleQuiz,
  enrolledStudents: [],
  createdAt: "",
  updatedAt: "",
};

const sampleChapters: Chapter[] = [
  {
    id: "ch1",
    title: "Getting Started with React",
    content: "Learn the basics of React components and JSX",
    order: 1,
    completed: false,
    duration: "15 min read",
  },
  {
    id: "ch2",
    title: "TypeScript Fundamentals",
    content: "Understanding types and interfaces in TypeScript",
    order: 2,
    completed: false,
    duration: "20 min read",
  },
  {
    id: "ch3",
    title: "Next.js Routing",
    content: "File-based routing and navigation in Next.js",
    order: 3,
    completed: false,
    duration: "18 min read",
  },
  {
    id: "ch4",
    title: "State Management",
    content: "Managing application state with hooks and context",
    order: 4,
    completed: false,
    duration: "25 min read",
  },
];

const sampleQuiz: Quiz = {
  id: "quiz1",
  title: "React Fundamentals Quiz",
  description: "Test your knowledge of React basics",
  timeLimit: 600, // 10 minutes
  questions: [
    {
      id: "q1",
      question: "What is JSX in React?",
      options: [
        "JavaScript XML - a syntax extension for JavaScript",
        "Just Syntax Extension - a CSS preprocessor",
        "JavaScript eXtended - a new programming language",
        "Java Syntax Extension - a Java library",
      ],
      correctAnswer: "JavaScript XML - a syntax extension for JavaScript",  // 
      explanation:
        "JSX is a syntax extension for JavaScript that lets you write HTML-like markup inside a JavaScript file.",
    },
    {
      id: "q2",
      question:
        "Which hook is used for managing component state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: "useState",
      explanation:
        "useState is the React hook that lets you add state to functional components.",
    },
    {
      id: "q3",
      question: "What is the purpose of the useEffect hook?",
      options: [
        "To manage component state",
        "To handle side effects in functional components",
        "To create context providers",
        "To optimize component rendering",
      ],
      correctAnswer: "To handle side effects in functional components",
      explanation:
        "useEffect lets you perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM.",
    },
  ],
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showReader, setShowReader] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter>(
    sampleChapters[0]
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>(sampleChapters);

  const handleStartReading = () => {
    setCurrentChapter(sampleChapters[0]);
    setShowReader(true);
  };

  const handleChapterChange = (chapter: Chapter) => {
    setCurrentChapter(chapter);
  };

  const handleCloseReader = () => {
    setShowReader(false);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = (score: number) => {
    console.log("Quiz completed with score:", score);
    // Update progress, unlock next content, etc.
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const completedChapters = chapters.filter((ch) => ch.completed).length;
  const progressPercentage = (completedChapters / chapters.length) * 100;

  if (showReader) {
    return (
      <CourseReader
        course={sampleCourse}
        currentChapter={currentChapter}
        chapters={chapters}
        onChapterChange={handleChapterChange}
        onClose={handleCloseReader}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 border-b border-slate-700/50"
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {sampleCourse.title}
            </h1>
            <p className="text-slate-400">by {sampleCourse.instructor}</p>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course overview */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Course Overview
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                {sampleCourse.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {sampleCourse.duration}
                  </div>
                  <div className="text-xs text-slate-400">Duration</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {sampleCourse.difficulty}
                  </div>
                  <div className="text-xs text-slate-400">Level</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {chapters.length}
                  </div>
                  <div className="text-xs text-slate-400">Chapters</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {sampleCourse.rating}
                  </div>
                  <div className="text-xs text-slate-400">Rating</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="glow"
                  onClick={handleStartReading}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Reading
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartQuiz}
                  className="flex-1"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Take Quiz
                </Button>
              </div>
            </motion.div>

            {/* Chapters list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                Course Content
              </h2>

              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer",
                      chapter.completed
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                    )}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setCurrentChapter(chapter);
                      setShowReader(true);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                          chapter.completed
                            ? "bg-green-500 text-white"
                            : "bg-slate-600 text-slate-300"
                        )}
                      >
                        {chapter.completed ? "✓" : index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{chapter.title}</h3>
                        <p className="text-sm opacity-70">{chapter.duration}</p>
                      </div>
                      <BookOpen className="w-4 h-4 opacity-60" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Progress
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Completed</span>
                  <span className="text-white font-medium">
                    {completedChapters}/{chapters.length} chapters
                  </span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-xs text-slate-400">Complete</div>
                </div>
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleStartReading}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Reading
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleStartQuiz}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Practice Quiz
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        quiz={sampleQuiz}
        isOpen={showQuiz}
        onClose={handleCloseQuiz}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
