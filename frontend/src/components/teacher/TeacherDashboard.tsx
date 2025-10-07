'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Upload,
  Edit3,
  Eye,
  Star,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Course } from '@/types';
import { cn } from '@/lib/utils';

interface TeacherDashboardProps {
  teacherId: string;
  className?: string;
}

// Sample teacher data - extending Course interface for teacher dashboard needs
interface TeacherCourse extends Course {
  enrollmentCount: number;
  rating: number;
  instructor: string;
  duration: string;
}

const sampleTeacherCourses: TeacherCourse[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Sarah Chen',
    instructor: 'Dr. Sarah Chen',
    thumbnail: '',
    color: '#3B82F6',
    difficulty: 'beginner',
    estimatedHours: 40,
    duration: '4 weeks',
    tags: ['HTML', 'CSS', 'JavaScript'],
    enrollmentCount: 245,
    rating: 4.8,
    chapters: [],
    finalExam: { 
      id: 'exam-1', 
      title: 'Final Exam', 
      questions: [], 
      timeLimit: 60,
      passingScore: 70,
      attempts: 3,
      type: 'final' as const
    },
    enrolledStudents: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts and patterns',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Sarah Chen',
    instructor: 'Dr. Sarah Chen',
    thumbnail: '',
    color: '#8B5CF6',
    difficulty: 'advanced',
    estimatedHours: 60,
    duration: '6 weeks',
    tags: ['React', 'JavaScript', 'Patterns'],
    enrollmentCount: 156,
    rating: 4.9,
    chapters: [],
    finalExam: { 
      id: 'exam-2', 
      title: 'Final Exam', 
      questions: [], 
      timeLimit: 90,
      passingScore: 75,
      attempts: 3,
      type: 'final' as const
    },
    enrolledStudents: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

const sampleStudents = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', progress: 85, lastActive: '2 hours ago' },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', progress: 72, lastActive: '1 day ago' },
  { id: '3', name: 'David Kim', email: 'david@example.com', progress: 94, lastActive: '30 minutes ago' },
  { id: '4', name: 'Emma Wilson', email: 'emma@example.com', progress: 67, lastActive: '3 days ago' }
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacherId,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<TeacherCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{sampleTeacherCourses.length}</p>
              <p className="text-sm text-slate-400">Active Courses</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {sampleTeacherCourses.reduce((acc, course) => acc + course.enrollmentCount, 0)}
              </p>
              <p className="text-sm text-slate-400">Total Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {(sampleTeacherCourses.reduce((acc, course) => acc + course.rating, 0) / sampleTeacherCourses.length).toFixed(1)}
              </p>
              <p className="text-sm text-slate-400">Avg Rating</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">89%</p>
              <p className="text-sm text-slate-400">Completion Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'New enrollment in "Web Development"', time: '2 hours ago', type: 'enrollment' },
              { action: 'Quiz completed by Alex Johnson', time: '4 hours ago', type: 'completion' },
              { action: 'Chapter updated in "React Patterns"', time: '1 day ago', type: 'update' },
              { action: 'New student review (5 stars)', time: '2 days ago', type: 'review' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  activity.type === 'enrollment' && "bg-blue-400",
                  activity.type === 'completion' && "bg-green-400",
                  activity.type === 'update' && "bg-yellow-400",
                  activity.type === 'review' && "bg-purple-400"
                )} />
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowCreateCourse(true)}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">New Course</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span className="text-xs">Upload Content</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Courses</h2>
        <Button
          variant="glow"
          onClick={() => setShowCreateCourse(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleTeacherCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 group hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.enrollmentCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Students</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Progress</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Last Active</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-t border-slate-700/50 hover:bg-slate-700/20"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-sm text-slate-400">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-white">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{student.lastActive}</td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Enrollment Trends</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Completion Rates</h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Target className="w-12 h-12 mx-auto mb-2" />
              <p>Progress tracking visualization</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900", className)}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-slate-400">Manage your courses and track student progress</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex gap-2 p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'courses' && renderCourses()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'analytics' && renderAnalytics()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};