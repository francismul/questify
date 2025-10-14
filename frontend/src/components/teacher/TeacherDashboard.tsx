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
import { getTeacherCourses, createCourse, updateCourse, CourseResponse, CourseData, getAllTeacherStudents, StudentData, getAllEnrollmentRequests, EnrollmentRequestResponse, approveEnrollmentRequest, rejectEnrollmentRequest } from "@/lib/auth-actions"

export function TeacherDashboard() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null)
  const [modalTitle, setModalTitle] = useState("")
  const [modalSubmitLabel, setModalSubmitLabel] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [courseData, studentData, enrollmentData] = await Promise.all([
        getTeacherCourses(),
        getAllTeacherStudents(),
        getAllEnrollmentRequests(),
      ])
      setCourses(courseData)
      setStudents(studentData)
      setEnrollmentRequests(enrollmentData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics from real data
  const totalStudents = students.length
  const averageRating = courses.length > 0 
    ? courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length 
    : 0
  const pendingRequests = enrollmentRequests.length
  const pendingReviews = students.filter(student => !student.completed).length
  const averageProgress = students.length > 0
    ? students.reduce((sum, student) => sum + (student.progress || 0), 0) / students.length
    : 0

  const teacherMetrics = [
    { 
      title: "Total Students", 
      value: totalStudents.toString(), 
      subtitle: "Enrolled in my courses", 
      color: "blue" as const, 
      percentage: totalStudents > 0 ? Math.min((totalStudents / 50) * 100, 100) : 0 
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
      title: "Pending Requests", 
      value: pendingRequests.toString(), 
      subtitle: "Enrollment requests awaiting approval", 
      color: "purple" as const, 
      percentage: pendingRequests > 0 ? Math.min((pendingRequests / 10) * 100, 100) : 0 
    },
    { 
      title: "Avg. Progress", 
      value: averageProgress > 0 ? `${Math.round(averageProgress)}%` : "N/A", 
      subtitle: "Student completion rate", 
      color: "cyan" as const, 
      percentage: averageProgress 
    },
    { 
      title: "Response Rate", 
      value: "95%", 
      subtitle: "Within 24 hours", 
      color: "purple" as const, 
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
        })
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
        })
      }
      await fetchData() // Refresh the course and student data
    } catch (error) {
      console.error("Error saving course:", error)
      throw error // Re-throw to let the modal handle the error
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveEnrollmentRequest(requestId)
      await fetchData() // Refresh data
    } catch (error) {
      console.error("Error approving enrollment request:", error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectEnrollmentRequest(requestId)
      await fetchData() // Refresh data
    } catch (error) {
      console.error("Error rejecting enrollment request:", error)
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

        {/* Enrollment Requests */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Enrollment Requests
            </h3>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading requests...</p>
            </div>
          ) : enrollmentRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending enrollment requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentRequests
                  .filter((request) => request.status === "pending")
                  .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.student_name}</p>
                        <p className="text-xs text-muted-foreground">{request.student_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{request.course_title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Student Progress Overview */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Student Progress
              </h3>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-2 bg-gray-200 rounded w-full max-w-[100px]"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.slice(0, 4).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {student.courses?.length || 0} course{student.courses?.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm">{student.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.completed ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            In Progress
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Student Highlights */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Student Highlights
              </h3>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                ))
              ) : students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No students enrolled yet.
                </p>
              ) : (
                (() => {
                  // Calculate real highlights from student data
                  const completedStudents = students.filter(s => s.completed);
                  const topPerformer = students.reduce((best, current) =>
                    (current.average_score || 0) > (best.average_score || 0) ? current : best,
                    students[0] || { name: 'N/A', average_score: 0 }
                  );
                  const mostActive = students.reduce((most, current) =>
                    (current.progress || 0) > (most.progress || 0) ? current : most,
                    students[0] || { name: 'N/A', progress: 0 }
                  );

                  const highlights = [
                    {
                      name: "Top Performer",
                      value: topPerformer.name,
                      count: topPerformer.average_score ? `${Math.round(topPerformer.average_score)}% avg score` : "No scores yet"
                    },
                    {
                      name: "Most Active",
                      value: mostActive.name,
                      count: `${mostActive.progress || 0}% progress`
                    },
                    {
                      name: "Completed Courses",
                      value: `${completedStudents.length} student${completedStudents.length !== 1 ? 's' : ''}`,
                      count: `${students.length > 0 ? Math.round((completedStudents.length / students.length) * 100) : 0}% completion rate`
                    },
                  ];

                  return highlights.map((activity, index) => (
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
                  ));
                })()
              )}
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
