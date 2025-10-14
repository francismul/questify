"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Clock, CheckCircle, TrendingUp } from "lucide-react";
import {
  getStudentCourses,
  getAllEnrollmentRequests,
  CourseResponse,
  EnrollmentRequestResponse,
} from "@/lib/auth-actions";

export function StudentCourses() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseResponse[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<
    EnrollmentRequestResponse[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesData, requestsData] = await Promise.all([
        getStudentCourses(),
        getAllEnrollmentRequests(),
      ]);
      setEnrolledCourses(coursesData);
      setEnrollmentRequests(requestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = enrollmentRequests.filter(
    (req) => req.status === "pending"
  );
  const approvedRequests = enrollmentRequests.filter(
    (req) => req.status === "approved"
  );
  const rejectedRequests = enrollmentRequests.filter(
    (req) => req.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Header */}
        <div className="bg-accent text-accent-foreground px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-bold text-lg">My Courses</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <span>{enrolledCourses.length} enrolled</span>
            <span>{pendingRequests.length} pending</span>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Pending Enrollment Requests ({pendingRequests.length})
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.course_title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        Awaiting Approval
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Enrolled Courses ({enrolledCourses.length})
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No courses enrolled yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Visit the dashboard to browse and request enrollment in
                available courses.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.description}
                        </p>
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
                        <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{course.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {course.completed ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/student/course/${course.id}/learn`)}
                      >
                        Continue Learning
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Request History */}
        {(approvedRequests.length > 0 || rejectedRequests.length > 0) && (
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Enrollment History
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...approvedRequests, ...rejectedRequests].map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.course_title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {request.reviewed_at
                        ? new Date(request.reviewed_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {request.status === "approved" ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
