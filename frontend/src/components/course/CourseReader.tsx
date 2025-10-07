'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Settings,
  Bookmark,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Course, Chapter } from '@/types';
import { cn } from '@/lib/utils';

interface CourseReaderProps {
  course: Course;
  currentChapter: Chapter;
  chapters: Chapter[];
  onChapterChange: (chapter: Chapter) => void;
  onClose: () => void;
  className?: string;
}

export const CourseReader: React.FC<CourseReaderProps> = ({
  course,
  currentChapter,
  chapters,
  onChapterChange,
  onClose,
  className
}) => {
  const [isReading, setIsReading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [fontSize, setFontSize] = useState('text-base');
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [autoRead, setAutoRead] = useState(false);

  const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === chapters.length - 1;

  // Simulate reading progress
  useEffect(() => {
    if (isReading) {
      const interval = setInterval(() => {
        setReadingProgress(prev => {
          if (prev >= 100) {
            setIsReading(false);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isReading]);

  const handlePrevChapter = () => {
    if (!isFirstChapter) {
      const prevChapter = chapters[currentChapterIndex - 1];
      onChapterChange(prevChapter);
      setReadingProgress(0);
    }
  };

  const handleNextChapter = () => {
    if (!isLastChapter) {
      const nextChapter = chapters[currentChapterIndex + 1];
      onChapterChange(nextChapter);
      setReadingProgress(0);
    }
  };

  const toggleReading = () => {
    setIsReading(!isReading);
  };

  const fontSizeOptions = [
    { label: 'Small', value: 'text-sm' },
    { label: 'Medium', value: 'text-base' },
    { label: 'Large', value: 'text-lg' },
    { label: 'Extra Large', value: 'text-xl' }
  ];

  return (
    <div className={cn('fixed inset-0 bg-slate-900 z-50', className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/5 to-slate-900" />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white">{course.title}</h1>
            <p className="text-sm text-slate-400">{currentChapter.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBookmarked(!bookmarked)}
            className={cn(
              "text-slate-400 hover:text-white",
              bookmarked && "text-yellow-400"
            )}
          >
            <Bookmark className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-16 bottom-20 w-80 bg-slate-800/95 backdrop-blur-sm border-l border-slate-700 p-6 z-40"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Reading Settings</h3>
            
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Font Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFontSize(option.value)}
                      className={cn(
                        "p-2 text-sm rounded-lg border transition-all",
                        fontSize === option.value
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Read */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Auto Read</span>
                <button
                  onClick={() => setAutoRead(!autoRead)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-colors",
                    autoRead ? "bg-blue-500" : "bg-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                    autoRead ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="relative z-10 h-full pt-16 pb-24">
        <motion.div
          key={currentChapter.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-full overflow-y-auto px-8 py-8"
        >
          <div className="max-w-4xl mx-auto">
            {/* Chapter content */}
            <div className={cn(
              "prose prose-invert max-w-none",
              fontSize,
              "prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed"
            )}>
              <h1 className="text-3xl font-bold text-white mb-8">{currentChapter.title}</h1>
              
              {/* Sample content - in real app this would be dynamic */}
              <div className="space-y-6">
                <p>
                  Welcome to this chapter of your learning journey. This is where the main content 
                  of the chapter would be displayed. The content could include text, images, 
                  code examples, and interactive elements.
                </p>
                
                <p>
                  The reading experience is designed to be immersive and distraction-free, 
                  with a clean typography and comfortable spacing. You can adjust the font 
                  size and other reading preferences using the settings panel.
                </p>
                
                <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Key Concepts</h2>
                
                <ul className="space-y-2">
                  <li>Interactive learning with real-time feedback</li>
                  <li>Progressive skill building and mastery tracking</li>
                  <li>Adaptive content based on your learning pace</li>
                  <li>Community-driven knowledge sharing</li>
                </ul>
                
                <p>
                  As you progress through the material, your reading progress is tracked 
                  and synchronized across all your devices. You can bookmark important 
                  sections and return to them later.
                </p>
                
                {/* Add more sample content to make it scrollable */}
                <div className="space-y-4 mt-12">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <p key={i}>
                      This is additional sample content to demonstrate the scrolling 
                      behavior and reading experience. In a real application, this 
                      would be the actual course material, including rich text, images, 
                      videos, and interactive elements.
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom control bar (media player style) */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 p-4 z-40"
      >
        {/* Progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-1 mb-4">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${readingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          {/* Left side - Chapter navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevChapter}
              disabled={isFirstChapter}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleReading}
              className="text-slate-400 hover:text-white"
            >
              {isReading ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextChapter}
              disabled={isLastChapter}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Center - Chapter info */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-white font-medium">
                Chapter {currentChapterIndex + 1} of {chapters.length}
              </p>
              <p className="text-xs text-slate-400">{Math.round(readingProgress)}% complete</p>
            </div>
          </div>
          
          {/* Right side - Additional controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChapterNav(!showChapterNav)}
              className="text-slate-400 hover:text-white"
            >
              <BookOpen className="w-5 h-5" />
            </Button>
            
            <div className="text-xs text-slate-400">
              {currentChapter.duration || `${currentChapter.estimatedMinutes || 5} min read`}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chapter navigation sidebar */}
      <AnimatePresence>
        {showChapterNav && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-0 top-16 bottom-20 w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 z-40 overflow-y-auto"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Chapters</h3>
              
              <div className="space-y-2">
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    onClick={() => {
                      onChapterChange(chapter);
                      setShowChapterNav(false);
                      setReadingProgress(0);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all",
                      chapter.id === currentChapter.id
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        chapter.id === currentChapter.id
                          ? "bg-blue-500 text-white"
                          : "bg-slate-600 text-slate-300"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-xs opacity-70">{chapter.duration || `${chapter.estimatedMinutes || 5} min read`}</p>
                      </div>
                      {chapter.completed && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};