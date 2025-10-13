"use client"

import { useState, useEffect } from "react"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { Button } from "@/components/ui/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Users, BookOpen, TrendingUp, MessageSquare, Edit, Plus } from "lucide-react"
import { CourseModal } from "./CourseModal"
import { getTeacherCourses, createCourse, updateCourse, CourseResponse } from "@/lib/auth-actions"

const recentSubmissions = [
  {
    id: 1,
    student: "Alice Johnson",
    assignment: "React Hooks Project",
    course: "Introduction to React",
    submittedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: 2,
    student: "Bob Smith",
    assignment: "TypeScript Quiz",
    course: "Advanced TypeScript",
    submittedAt: "5 hours ago",
    status: "pending",
  },
  {
    id: 3,
    student: "Carol Williams",
    assignment: "Design Portfolio",
    course: "Web Design Fundamentals",
    submittedAt: "1 day ago",
    status: "graded",
  },
  {
    id: 4,
    student: "David Brown",
    assignment: "API Integration",
    course: "Full Stack Development",
    submittedAt: "1 day ago",
    status: "pending",
  },
]

const studentActivity = [
  { name: "Most Active", value: "Alice Johnson", count: "42 hrs this week" },
  { name: "Top Performer", value: "Bob Smith", count: "98% avg score" },
  { name: "Needs Support", value: "Eva Garcia", count: "3 missed deadlines" },
]

export function TeacherDashboard() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)
  const [modalTitle, setModalTitle] = useState("")
  const [modalSubmitLabel, setModalSubmitLabel] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const courseData = await getTeacherCourses()
      setCourses(courseData)
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics from real data
  const totalStudents = courses.reduce((sum, course) => sum + course.enrollment_count, 0)
  const averageRating = courses.length > 0 
    ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
    : 0

  const teacherMetrics = [
    { 
      title: "Total Students", 
      value: totalStudents.toString(), 
      subtitle: "Enrolled in my courses", 
      color: "blue" as const, 
      percentage: 78 
    },
    { 
      title: "Active Courses", 
      value: courses.length.toString(),
      subtitle: "Courses I've created", 
      color: "green" as const, 
      percentage: 100 
    },
    { 
      title: "Avg. Rating", 
      value: averageRating > 0 ? averageRating.toFixed(1) : "N/A", 
      subtitle: "Student ratings", 
      color: "yellow" as const, 
      percentage: averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0 
    },
    { 
      title: "Pending Reviews", 
      value: "23", 
      subtitle: "Assignments to grade", 
      color: "red" as const, 
      percentage: 45 
    },
    { 
      title: "Response Rate", 
      value: "95%", 
      subtitle: "Within 24 hours", 
      color: "cyan" as const, 
      percentage: 95 
    },
  ]

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setModalTitle("Create New Course")
    setModalSubmitLabel("Create Course")
    setModalOpen(true)
  }

  const handleEditCourse = (course: CourseResponse) => {
    setEditingCourse(course)
    setModalTitle("Edit Course")
    setModalSubmitLabel("Update Course")
    setModalOpen(true)
  }

  const handleCourseSubmit = async (courseData: any) => {
    try {
      if (editingCourse) {
        // Update existing course
        await updateCourse(editingCourse.id, {
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimatedHours,
          color: courseData.color,
          thumbnail: courseData.thumbnail,
          tags: courseData.tags,
        })
      } else {
        // Create new course
        await createCourse({
          title: courseData.title,
          description: courseData.description,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimatedHours,
          color: courseData.color,
          thumbnail: courseData.thumbnail,
          tags: courseData.tags,
        })
      }
      await fetchCourses() // Refresh the course list
    } catch (error) {
      console.error("Error saving course:", error)
      throw error // Re-throw to let the modal handle the error
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCourse(null)
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Insights Banner */}
        <div className="bg-accent text-accent-foreground px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="font-bold text-lg">Teaching Dashboard</h2>
          </div>
          <span className="text-sm font-medium">Academic Year 2025</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {teacherMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Course Statistics */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              My Courses
            </h3>
            <Button size="sm" variant="accent" onClick={handleCreateCourse}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No courses created yet</p>
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
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.difficulty}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{course.enrollment_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{course.rating.toFixed(1)}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No ratings</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCourse(course)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Submissions */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Submissions
              </h3>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{submission.student}</p>
                        <p className="text-xs text-muted-foreground">{submission.submittedAt}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{submission.assignment}</p>
                        <p className="text-xs text-muted-foreground">{submission.course}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.status === 'pending' ? (
                        <Button size="sm" variant="accent">
                          Grade Now
                        </Button>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-metric-green/10 text-metric-green">
                          Graded
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Student Activity Highlights */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Student Highlights
              </h3>
            </div>
            <div className="space-y-4">
              {studentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start justify-between p-4 bg-accent/5 rounded-lg border border-accent/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {activity.name}
                    </p>
                    <p className="font-medium">{activity.value}</p>
                  </div>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                    {activity.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <Button className="w-full" variant="accent">
                Send Announcement
              </Button>
              <Button className="w-full" variant="outline">
                Schedule Office Hours
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Course Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCourseSubmit}
        initialData={editingCourse ? {
          title: editingCourse.title,
          description: editingCourse.description,
          difficulty: editingCourse.difficulty,
          estimated_hours: editingCourse.estimated_hours,
          color: editingCourse.color,
          thumbnail: editingCourse.thumbnail,
          tags: editingCourse.tags,
        } : undefined}
        title={modalTitle}
        submitLabel={modalSubmitLabel}
      />
    </div>
  )
}
