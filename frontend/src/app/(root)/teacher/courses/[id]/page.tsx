"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FileQuestion,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import { ChapterModal } from "@/components/teacher/ChapterModal";
import { QuizModal } from "@/components/teacher/QuizModal";
import { QuestionModal } from "@/components/teacher/QuestionModal";
import {
  getTeacherCourses,
  getCourseChapters,
  getCourseQuizzes,
  deleteChapter,
  deleteQuiz,
  CourseResponse,
  ChapterResponse,
  QuizResponse,
} from "@/lib/auth-actions";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterResponse[]>([]);
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'quizzes'>('chapters');

  // Modal states
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<QuizResponse | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");

  const fetchCourseData = useCallback(async () => {
    try {
      // Fetch course details
      const courses = await getTeacherCourses();
      const currentCourse = courses.find(c => c.id === courseId);
      setCourse(currentCourse || null);

      // Fetch chapters and quizzes in parallel
      const [chaptersData, quizzesData] = await Promise.all([
        getCourseChapters(courseId),
        getCourseQuizzes(courseId),
      ]);

      setChapters(chaptersData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleDeleteChapter = async (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      try {
        await deleteChapter(chapterId);
        await fetchCourseData(); // Refresh data
      } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Failed to delete chapter");
      }
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteQuiz(quizId);
        await fetchCourseData(); // Refresh data
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Failed to delete quiz");
      }
    }
  };

  // Modal handlers
  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterModalOpen(true);
  };

  const handleEditChapter = (chapter: ChapterResponse) => {
    setEditingChapter(chapter);
    setChapterModalOpen(true);
  };

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setQuizModalOpen(true);
  };

  const handleEditQuiz = (quiz: QuizResponse) => {
    setEditingQuiz(quiz);
    setQuizModalOpen(true);
  };

  const handleAddQuestion = (quizId: string) => {
    setSelectedQuizId(quizId);
    setQuestionModalOpen(true);
  };

  const handleCloseModals = () => {
    setChapterModalOpen(false);
    setQuizModalOpen(false);
    setQuestionModalOpen(false);
    setEditingChapter(null);
    setEditingQuiz(null);
    setSelectedQuizId("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
        <Link href="/teacher/courses">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/teacher/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold">{course.enrollment_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Chapters</p>
                <p className="text-2xl font-bold">{chapters.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FileQuestion className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-2xl font-bold">{course.rating?.toFixed(1) || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chapters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chapters ({chapters.length})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quizzes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quizzes ({quizzes.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chapters' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Course Chapters</h2>
            <Button onClick={handleAddChapter}>
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first chapter.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Chapter
              </Button>
            </div>
          ) : (
            <div className="bg-card shadow rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapters.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell className="font-medium">{chapter.order}</TableCell>
                      <TableCell>{chapter.title}</TableCell>
                      <TableCell>{chapter.duration || `${chapter.estimated_minutes} min`}</TableCell>
                      <TableCell>
                        {chapter.quiz ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Has Quiz
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No Quiz
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditChapter(chapter)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Course Quizzes</h2>
            <Button onClick={handleAddQuiz}>
              <Plus className="w-4 h-4 mr-2" />
              Add Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
              <p className="text-gray-600 mb-4">Create quizzes to test your students&apos; knowledge.</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Quiz
              </Button>
            </div>
          ) : (
            <div className="bg-card shadow rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quiz.type === 'final'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {quiz.type === 'final' ? 'Final Exam' : 'Chapter Quiz'}
                        </span>
                      </TableCell>
                      <TableCell>{quiz.questions?.length || 0}</TableCell>
                      <TableCell>{quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}</TableCell>
                      <TableCell>{quiz.passing_score}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditQuiz(quiz)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleAddQuestion(quiz.id)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ChapterModal
        isOpen={chapterModalOpen}
        onClose={handleCloseModals}
        courseId={courseId}
        chapter={editingChapter}
        onSuccess={fetchCourseData}
        existingChapters={chapters}
      />

      <QuizModal
        isOpen={quizModalOpen}
        onClose={handleCloseModals}
        courseId={courseId}
        quiz={editingQuiz}
        onSuccess={fetchCourseData}
        chapters={chapters}
      />

      <QuestionModal
        isOpen={questionModalOpen}
        onClose={handleCloseModals}
        quizId={selectedQuizId}
        onSuccess={fetchCourseData}
      />
    </div>
  );
}