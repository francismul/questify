"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, BookOpen, Edit, Plus, Trash2, Eye } from "lucide-react";
import { CourseModal } from "./CourseModal";
import {
  getTeacherCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  CourseResponse,
  CourseData,
} from "@/lib/auth-actions";
import Image from "next/image";

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubmitLabel, setModalSubmitLabel] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const courseData = await getTeacherCourses();
      setCourses(courseData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setModalTitle("Create New Course");
    setModalSubmitLabel("Create Course");
    setModalOpen(true);
  };

  const handleEditCourse = (course: CourseResponse) => {
    setEditingCourse(course);
    setModalTitle("Edit Course");
    setModalSubmitLabel("Update Course");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCourse(null);
  };

  const handleCourseSubmit = async (courseData: CourseData) => {
    try {
      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse.id, {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimated_hours,
          color: courseData.color,
          thumbnail: courseData.thumbnail,
          tags: courseData.tags,
        });
      } else {
        // Create new course
        await createCourse({
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimated_hours,
          color: courseData.color,
          thumbnail: courseData.thumbnail,
          tags: courseData.tags,
        });
      }
      await fetchCourses(); // Refresh the course list
    } catch (error) {
      console.error("Error saving course:", error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteCourse(courseId);
      await fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage and create your courses here
          </p>
        </div>
        <Button
          onClick={handleCreateCourse}
          size="lg"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Course
        </Button>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.reduce(
                  (sum, course) => sum + course.enrollment_count,
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {
                  courses.filter((course) => course.difficulty === "beginner")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Beginner Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">All Courses</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all your created courses
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first course
            </p>
            <Button onClick={handleCreateCourse} variant="accent">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Estimated Hours</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {course.thumbnail && (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-10 h-10 rounded-lg object-cover"
                          height={400}
                          width={400}
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {course.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.difficulty === "beginner"
                          ? "bg-green-100 text-green-800"
                          : course.difficulty === "intermediate"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {course.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{course.enrollment_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>{course.estimated_hours}h</TableCell>
                  <TableCell>
                    {new Date(course.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/teacher/courses/${course.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Manage Content
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCourse(course)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCourseSubmit}
        initialData={
          editingCourse
            ? {
                title: editingCourse.title,
                description: editingCourse.description,
                difficulty: editingCourse.difficulty,
                estimated_hours: editingCourse.estimated_hours,
                color: editingCourse.color,
                thumbnail: editingCourse.thumbnail,
                tags: editingCourse.tags,
              }
            : undefined
        }
        title={modalTitle}
        submitLabel={modalSubmitLabel}
      />
    </div>
  );
}
