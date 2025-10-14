"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Users, UserX, AlertTriangle } from "lucide-react"
import { getAllTeacherStudents, getTeacherCourses, dismissStudentFromCourse, getAllEnrollmentRequests, approveEnrollmentRequest, rejectEnrollmentRequest, StudentData, CourseResponse, EnrollmentRequestResponse } from "@/lib/auth-actions"

export function TeacherStudents() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequestResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissing, setDismissing] = useState<string | null>(null)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentData, courseData, enrollmentData] = await Promise.all([
        getAllTeacherStudents(),
        getTeacherCourses(),
        getAllEnrollmentRequests(),
      ])
      setStudents(studentData)
      setCourses(courseData)
      setEnrollmentRequests(enrollmentData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismissFromCourse = async (studentId: string, courseId: string) => {
    const confirmDismiss = window.confirm(
      "Are you sure you want to dismiss this student from the course? This action cannot be undone."
    )

    if (!confirmDismiss) return

    setDismissing(`${studentId}-${courseId}`)
    try {
      await dismissStudentFromCourse(courseId, studentId)
      await fetchData() // Refresh the data
    } catch (error) {
      console.error("Error dismissing student:", error)
      alert("Failed to dismiss student. Please try again.")
    } finally {
      setDismissing(null)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    setProcessingRequest(requestId)
    try {
      await approveEnrollmentRequest(requestId)
      await fetchData() // Refresh the data
    } catch (error) {
      console.error("Error approving enrollment request:", error)
      alert("Failed to approve enrollment request. Please try again.")
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this enrollment request?"
    )

    if (!confirmReject) return

    setProcessingRequest(requestId)
    try {
      await rejectEnrollmentRequest(requestId)
      await fetchData() // Refresh the data
    } catch (error) {
      console.error("Error rejecting enrollment request:", error)
      alert("Failed to reject enrollment request. Please try again.")
    } finally {
      setProcessingRequest(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Header */}
        <div className="bg-accent text-accent-foreground px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="font-bold text-lg">Student Management</h2>
          </div>
          <span className="text-sm font-medium">{students.length} students enrolled</span>
        </div>

        {/* Enrollment Requests */}
        {enrollmentRequests.filter((request) => request.status === "pending").length > 0 && (
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Pending Enrollment Requests ({enrollmentRequests.filter((request) => request.status === "pending").length})
              </h3>
            </div>

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
                          disabled={processingRequest === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingRequest === request.id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processingRequest === request.id}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {processingRequest === request.id ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">All Students</h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students enrolled in your courses yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrolled Courses</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {student.courses?.map((courseTitle, index) => (
                          <span
                            key={index}
                            className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full"
                          >
                            {courseTitle}
                          </span>
                        ))}
                      </div>
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {student.courses?.map((courseTitle, index) => {
                          const course = courses.find(c => c.title === courseTitle)
                          if (!course) return null
                          const isDismissing = dismissing === `${student.id}-${course.id}`
                          return (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismissFromCourse(student.id, course.id)}
                              disabled={isDismissing}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <UserX className="w-4 h-4" />
                              {isDismissing ? "Dismissing..." : `Dismiss from ${courseTitle}`}
                            </Button>
                          )
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  )
}