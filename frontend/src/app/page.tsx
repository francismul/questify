'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LogIn, UserPlus, User, Settings, BookOpen, BarChart3 } from 'lucide-react';
import { FloatingHub } from '@/components/navigation/FloatingHub';
import { TimelineUniverse } from '@/components/course/TimelineUniverse';
import { sampleCourses, sampleProgress, sampleStudent } from '@/lib/sampleData';
import { Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedSection, setSelectedSection] = useState<'courses' | 'progress' | 'community' | 'settings' | null>('courses');

  const handleSectionSelect = (section: 'courses' | 'progress' | 'community' | 'settings') => {
    setSelectedSection(section);
    console.log('Selected section:', section);
  };

  const handleCourseSelect = (course: Course) => {
    // Navigate to course page
    window.location.href = `/course/${course.id}`;
  };

  const handleLogout = () => {
    logout();
    setSelectedSection('courses');
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'courses':
        return (
          <TimelineUniverse
            courses={sampleCourses}
            userProgress={sampleProgress}
            onCourseSelect={handleCourseSelect}
          />
        );
      case 'progress':
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Your Progress</h2>
              <p className="text-slate-400">Coming soon...</p>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Community</h2>
              <p className="text-slate-400">Connect with other learners...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
              >
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Settings className="w-8 h-8" />
                  Settings
                </h2>
                
                {isAuthenticated && user ? (
                  <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="border-b border-slate-700 pb-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                          <div className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-600">
                            {user.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                          <div className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-600">
                            {user.email}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                          <div className="text-white bg-slate-900/50 p-3 rounded-lg border border-slate-600 capitalize">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="border-b border-slate-700 pb-6">
                      <h3 className="text-xl font-semibold text-white mb-4">Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Dark Mode</span>
                          <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Email Notifications</span>
                          <div className="w-12 h-6 bg-slate-600 rounded-full relative">
                            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Access */}
                    {user.role === 'teacher' && (
                      <div className="border-b border-slate-700 pb-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Teacher Tools</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Link href="/teacher/dashboard">
                            <Button variant="glow" className="w-full">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Teacher Dashboard
                            </Button>
                          </Link>
                          <Button variant="outline" className="w-full">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Course Management
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setSelectedSection('courses')}>
                        Back to Courses
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">Please log in to access settings</p>
                    <Link href="/auth/login">
                      <Button variant="glow">Sign In</Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        );
      default:
        return (
          <TimelineUniverse
            courses={sampleCourses}
            userProgress={sampleProgress}
            onCourseSelect={handleCourseSelect}
          />
        );
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-900 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 pointer-events-none" />
      
      {/* Content area */}
      <div className="relative z-10">
        {renderContent()}
      </div>

      {/* Floating Hub Navigation */}
      <FloatingHub
        userProgress={sampleStudent.totalXP / 50} // Convert XP to percentage for demo
        userLevel={sampleStudent.level}
        onSectionSelect={handleSectionSelect}
      />

      {/* Welcome overlay for first-time users */}
            {/* Welcome card */}
      <div className="fixed top-4 right-4 z-20 max-w-xs">
        <motion.div 
          className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700 p-3 shadow-xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{user.name}</h2>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                Welcome back! Explore your courses and track your progress.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleSectionSelect('settings')}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-white mb-2">Welcome to Questify</h1>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">
                Scroll horizontally through your learning timeline. Click the floating hub (bottom-right) to navigate sections.
              </p>
              
              {/* Auth buttons */}
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <LogIn className="w-3 h-3 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" className="flex-1">
                  <Button variant="glow" size="sm" className="w-full text-xs">
                    <UserPlus className="w-3 h-3 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
