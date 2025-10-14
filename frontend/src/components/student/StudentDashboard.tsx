"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, TrendingUp, Award, Clock, Plus, Users } from "lucide-react";
import {
  getAvailableCourses,
  getStudentCourses,
  requestCourseEnrollment,
  getAllEnrollmentRequests,
  CourseResponse,
  EnrollmentRequestResponse,
} from "@/lib/auth-actions";

export function StudentDashboard() {
  const [availableCourses, setAvailableCourses] = useState<CourseResponse[]>(
    []
  );
  const [enrolledCourses, setEnrolledCourses] = useState<CourseResponse[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<
    EnrollmentRequestResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const [available, enrolled, requests] = await Promise.all([
        getAvailableCourses(),
        getStudentCourses(),
        getAllEnrollmentRequests(),
      ]);
      setAvailableCourses(available);
      setEnrolledCourses(enrolled);
      setEnrollmentRequests(requests);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    try {
      const result = await requestCourseEnrollment(courseId);
      // Refresh data after enrollment request
      await fetchCourses();
      console.log("Enrollment requested:", result.message);
    } catch (error) {
      console.error("Error requesting enrollment:", error);
    } finally {
      setEnrolling(null);
    }
  };

  const getEnrollmentStatus = (courseId: string) => {
    const request = enrollmentRequests.find((req) => req.course === courseId);
    return request?.status || null;
  };

  // Calculate metrics from real data
  const enrolledCount = enrolledCourses.length;
  const completedCount = enrolledCourses.filter(
    (course) => course.progress === 100
  ).length;
  const inProgressCount = enrolledCount - completedCount;
  const averageScore =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce(
          (sum, course) => sum + (course.average_score || 0),
          0
        ) / enrolledCourses.length
      : 0;

  const studentMetrics = [
    {
      title: "Courses Enrolled",
      value: enrolledCount.toString(),
      subtitle: "Active courses",
      color: "blue" as const,
      percentage:
        enrolledCount > 0 ? Math.min((enrolledCount / 10) * 100, 100) : 0,
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      subtitle: "Finished courses",
      color: "green" as const,
      percentage:
        enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0,
    },
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      subtitle: "Currently learning",
      color: "yellow" as const,
      percentage:
        enrolledCount > 0 ? (inProgressCount / enrolledCount) * 100 : 0,
    },
    {
      title: "Average Score",
      value: averageScore > 0 ? `${Math.round(averageScore)}%` : "N/A",
      subtitle: "Quiz performance",
      color: "purple" as const,
      percentage: averageScore,
    },
    {
      title: "Available Courses",
      value: availableCourses.length.toString(),
      subtitle: "Ready to enroll",
      color: "cyan" as const,
      percentage: Math.min(availableCourses.length * 10, 100),
    },
    {
      title: "Achievements",
      value: "12", // This would come from a real achievements API
      subtitle: "Badges earned",
      color: "red" as const,
      percentage: 60,
    },
  ];
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Insights Banner */}
        <div className="bg-accent text-accent-foreground px-6 py-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="font-bold text-lg">Student Insights</h2>
          </div>
          <span className="text-sm font-medium">Academic Year 2025</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {studentMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Courses */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Recent Courses
              </h3>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Accessed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-2 bg-gray-200 rounded w-full max-w-[100px]"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : enrolledCourses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
                      You haven't enrolled in any courses yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  enrolledCourses.slice(0, 3).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.teacher_name || "Teacher"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{ width: `${course.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {course.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        Recently accessed
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Available Courses */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Available Courses
              </h3>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : availableCourses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-gray-500"
                    >
                      No courses available at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  availableCourses.slice(0, 3).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {course.teacher_name || "Teacher"}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const status = getEnrollmentStatus(course.id);
                          if (status === "pending") {
                            return (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 truncate">
                                Awaiting Approval
                              </span>
                            );
                          } else if (status === "approved") {
                            return (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 truncate">
                                Already Enrolled
                              </span>
                            );
                          } else if (status === "rejected") {
                            return (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 truncate">
                                Rejected
                              </span>
                            );
                          } else {
                            return (
                              <Button
                                size="sm"
                                onClick={() => handleEnroll(course.id)}
                                disabled={enrolling === course.id}
                              >
                                {enrolling === course.id
                                  ? "Requesting..."
                                  : "Request Enrollment"}
                              </Button>
                            );
                          }
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Recent Achievements
            </h3>
            <Button size="sm" variant="accent">
              View All Badges
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Fast Learner", icon: "⚡" },
              { name: "Quiz Master", icon: "🏆" },
              { name: "Perfect Score", icon: "💯" },
              { name: "Week Streak", icon: "🔥" },
              { name: "Early Bird", icon: "🌅" },
              { name: "Helpful Peer", icon: "🤝" },
            ].map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-accent/5 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors"
              >
                <span className="text-3xl mb-2">{badge.icon}</span>
                <span className="text-xs font-medium text-center">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
