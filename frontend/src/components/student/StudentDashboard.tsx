"use client";

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
import { BookOpen, TrendingUp, Award, Clock } from "lucide-react";

const studentMetrics = [
  {
    title: "Courses Enrolled",
    value: 8,
    subtitle: "Active courses",
    color: "blue" as const,
    percentage: 80,
  },
  {
    title: "Completed",
    value: 5,
    subtitle: "Finished courses",
    color: "green" as const,
    percentage: 62,
  },
  {
    title: "In Progress",
    value: 3,
    subtitle: "Currently learning",
    color: "yellow" as const,
    percentage: 38,
  },
  {
    title: "Average Score",
    value: "87%",
    subtitle: "Quiz performance",
    color: "purple" as const,
    percentage: 87,
  },
  {
    title: "Study Hours",
    value: 42,
    subtitle: "This month",
    color: "cyan" as const,
    percentage: 70,
  },
  {
    title: "Achievements",
    value: 12,
    subtitle: "Badges earned",
    color: "red" as const,
    percentage: 60,
  },
];

const recentCourses = [
  {
    id: 1,
    name: "Introduction to React",
    progress: 75,
    lastAccessed: "2 hours ago",
    instructor: "Dr. Smith",
  },
  {
    id: 2,
    name: "Advanced TypeScript",
    progress: 45,
    lastAccessed: "1 day ago",
    instructor: "Prof. Johnson",
  },
  {
    id: 3,
    name: "Web Design Fundamentals",
    progress: 90,
    lastAccessed: "3 days ago",
    instructor: "Ms. Davis",
  },
];

const upcomingAssignments = [
  {
    id: 1,
    title: "React Hooks Assignment",
    course: "Introduction to React",
    dueDate: "Oct 12, 2025",
    priority: "high",
  },
  {
    id: 2,
    title: "TypeScript Quiz",
    course: "Advanced TypeScript",
    dueDate: "Oct 15, 2025",
    priority: "medium",
  },
  {
    id: 3,
    title: "Design Project",
    course: "Web Design Fundamentals",
    dueDate: "Oct 20, 2025",
    priority: "low",
  },
];

export function StudentDashboard() {
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
                {recentCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.instructor}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-accent h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{course.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {course.lastAccessed}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Upcoming Assignments
              </h3>
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.course}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {assignment.dueDate}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`
                        text-xs font-medium px-2 py-1 rounded-full
                        ${
                          assignment.priority === "high"
                            ? "bg-metric-red/10 text-metric-red"
                            : ""
                        }
                        ${
                          assignment.priority === "medium"
                            ? "bg-metric-yellow/10 text-metric-yellow"
                            : ""
                        }
                        ${
                          assignment.priority === "low"
                            ? "bg-metric-green/10 text-metric-green"
                            : ""
                        }
                      `}
                      >
                        {assignment.priority}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
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
