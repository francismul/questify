import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Lock, CheckCircle, Star, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course, StudentProgress } from '@/types';
import { ProgressRing } from '@/components/ui/ProgressRing';

interface TimelineUniverseProps {
  courses: Course[];
  userProgress: Record<string, StudentProgress>;
  onCourseSelect?: (course: Course) => void;
  className?: string;
}

interface CourseNodeProps {
  course: Course;
  progress?: StudentProgress;
  position: { x: number; y: number };
  isActive: boolean;
  onSelect: (course: Course) => void;
  index: number;
}

const CourseNode: React.FC<CourseNodeProps> = ({
  course,
  progress,
  position,
  isActive,
  onSelect,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false); // For mobile interactions
  const completionPercentage = progress ? 
    Math.round((progress.completedChapters.length / course.chapters.length) * 100) : 0;
  
  const isCompleted = progress?.completed || false;
  const isEnrolled = !!progress;
  const isLocked = !isEnrolled && index > 0; // First course is always unlocked
  
  // Show card on hover (desktop) or click (mobile)
  const showCard = isHovered || isClicked;

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { delay: index * 0.1, type: "spring" as const, stiffness: 400, damping: 25 }
    },
    hover: { scale: 1.1 }
  };

  const getNodeColor = () => {
    if (isCompleted) return 'from-green-500 to-emerald-600';
    if (isActive) return 'from-blue-500 to-purple-600';
    if (isEnrolled) return 'from-orange-500 to-amber-600';
    if (isLocked) return 'from-slate-600 to-slate-700';
    return 'from-slate-500 to-slate-600';
  };

  const getGlowColor = () => {
    if (isCompleted) return 'shadow-green-500/50';
    if (isActive) return 'shadow-blue-500/50';
    if (isEnrolled) return 'shadow-orange-500/50';
    return '';
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: position.x, top: position.y }}
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connection line to next course */}
      {index < 10 && ( // Assuming max 10 courses for demo
        <motion.div
          className="absolute top-1/2 left-full w-48 h-0.5 bg-gradient-to-r from-slate-600 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
        />
      )}

      {/* Course Node */}
      <motion.button
        className={cn(
          "relative w-20 h-20 rounded-full bg-gradient-to-br shadow-lg",
          "flex items-center justify-center transition-all duration-300",
          "border-2 border-slate-700 hover:border-slate-500",
          getNodeColor(),
          getGlowColor(),
          isLocked && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !isLocked && onSelect(course)}
        disabled={isLocked}
        whileHover={{ 
          boxShadow: isLocked ? undefined : "0 0 30px rgba(59, 130, 246, 0.4)" 
        }}
      >
        {/* Progress ring overlay */}
        {isEnrolled && !isCompleted && (
          <div className="absolute inset-0">
            <ProgressRing
              progress={completionPercentage}
              size="lg"
              showText={false}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {isLocked ? (
            <Lock className="w-8 h-8 text-slate-400" />
          ) : isCompleted ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : isEnrolled ? (
            <Play className="w-8 h-8 text-white" />
          ) : (
            <Star className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Pulse effect for active course */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Course Info Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700 p-4 shadow-xl z-20"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Course thumbnail */}
            <div className={cn(
              "w-full h-32 rounded-lg bg-gradient-to-br mb-3",
              getNodeColor()
            )} />

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-white text-lg">{course.title}</h3>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrolledStudents.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    course.difficulty === 'beginner' && "bg-green-500/20 text-green-400",
                    course.difficulty === 'intermediate' && "bg-yellow-500/20 text-yellow-400",
                    course.difficulty === 'advanced' && "bg-red-500/20 text-red-400"
                  )}>
                    {course.difficulty}
                  </span>
                </div>
              </div>

              {isEnrolled && (
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="mt-1 w-full bg-slate-700 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </div>
                </div>
              )}

              {isLocked && (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500">
                    Complete previous courses to unlock
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const TimelineUniverse: React.FC<TimelineUniverseProps> = ({
  courses,
  userProgress,
  onCourseSelect,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  
  // Transform scroll progress to background parallax
  const backgroundX = useTransform(scrollXProgress, [0, 1], ['0%', '-20%']);
  
  const [activeCourseIndex, setActiveCourseIndex] = useState(0);

  // Calculate positions for courses along the timeline
  const getCoursePosition = (index: number) => {
    const spacing = 320; // Increased spacing
    const x = index * spacing + 150; // More left padding
    const y = 120 + Math.sin(index * 0.3) * 30; // Reduced wave, lower position
    return { x, y };
  };

  useEffect(() => {
    // Auto-scroll to show the first incomplete course
    const firstIncomplete = courses.findIndex(course => {
      const progress = userProgress[course.id];
      return !progress?.completed;
    });
    
    if (firstIncomplete !== -1) {
      setActiveCourseIndex(firstIncomplete);
    }
  }, [courses, userProgress]);

  return (
    <div className={cn("relative w-full h-screen overflow-hidden", className)}>
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/5 to-slate-900"
        style={{ x: backgroundX }}
      >
        {/* Floating particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Horizontal scrolling timeline */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div 
          className="relative h-full"
          style={{ width: `${courses.length * 320 + 300}px` }}
        >
          {/* Timeline path */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
          >
            <motion.path
              d={`M 50 ${150 + Math.sin(0 * 0.3) * 50} ${courses.map((_, i) => {
                const pos = getCoursePosition(i);
                return `L ${pos.x + 40} ${pos.y + 40}`;
              }).join(' ')}`}
              stroke="rgba(71, 85, 105, 0.5)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />
          </svg>

          {/* Course nodes */}
          {courses.map((course, index) => (
            <CourseNode
              key={course.id}
              course={course}
              progress={userProgress[course.id]}
              position={getCoursePosition(index)}
              isActive={index === activeCourseIndex}
              onSelect={onCourseSelect || (() => {})}
              index={index}
            />
          ))}

          {/* Learning galaxy (completed courses orbiting around user avatar) */}
          <motion.div
            className="absolute top-8 right-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {/* User avatar at center */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
            </div>

            {/* Orbiting completed courses */}
            {courses
              .filter(course => userProgress[course.id]?.completed)
              .slice(0, 5) // Show max 5 orbiting courses
              .map((course, index) => (
                <motion.div
                  key={course.id}
                  className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    x: [0, 60 * Math.cos(index * (Math.PI * 2 / 5)), 0, -60 * Math.cos(index * (Math.PI * 2 / 5)), 0],
                    y: [60 * Math.sin(index * (Math.PI * 2 / 5)), 0, -60 * Math.sin(index * (Math.PI * 2 / 5)), 0, 60 * Math.sin(index * (Math.PI * 2 / 5))]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 4
                  }}
                >
                  <CheckCircle className="w-full h-full text-white p-1" />
                </motion.div>
              ))}
          </motion.div>
        </div>
      </div>

      {/* Navigation hints */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <motion.p
          className="text-slate-400 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll horizontally to explore your learning journey
        </motion.p>
      </div>
    </div>
  );
};