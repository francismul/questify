import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  Star,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface FloatingHubProps {
  userProgress?: number;
  userLevel?: number;
  onSectionSelect?: (
    section: "courses" | "progress" | "community" | "settings"
  ) => void;
  className?: string;
}

export const FloatingHub: React.FC<FloatingHubProps> = ({
  userProgress = 75,
  userLevel = 5,
  onSectionSelect,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 🧭 Flipped layout for left-leaning menu
  const menuItems = [
    {
      id: "courses",
      icon: BookOpen,
      label: "Courses",
      color: "from-blue-500 to-cyan-500",
      position: { x: -5, y: -100 }, // further to the left
    },
    {
      id: "progress",
      icon: TrendingUp,
      label: "Progress",
      color: "from-green-500 to-emerald-500",
      position: { x: -55, y: -90 }, // middle-left
    },
    {
      id: "community",
      icon: Users,
      label: "Community",
      color: "from-purple-500 to-pink-500",
      position: { x: -95, y: -60 }, // bottom-left
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      color: "from-orange-500 to-red-500",
      position: { x: -90, y: -10 }, // slightly below-left
    },
  ];

  const handleToggle = () => setIsOpen(!isOpen);
  const handleItemClick = (
    section: "courses" | "progress" | "community" | "settings"
  ) => {
    onSectionSelect?.(section);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50",
        className
      )}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl z-0"
          animate={{
            scale: isOpen ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isOpen ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Menu Items */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  className={cn(
                    "absolute w-12 h-12 rounded-full bg-gradient-to-r shadow-lg",
                    "flex items-center justify-center text-white font-medium",
                    "hover:scale-110 transition-transform duration-200 z-20",
                    item.color
                  )}
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    x: item.position.x,
                    y: item.position.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  onClick={() => handleItemClick(item.id as any)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon className="w-5 h-5" />

                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 
                 bg-slate-800 text-white text-xs rounded whitespace-nowrap 
                 border border-slate-600 shadow-lg z-[200]"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}

                        <div
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 
                      border-t-4 border-b-4 border-l-4 border-transparent border-l-slate-800"
                        ></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* Progress Ring */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 0.9 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <ProgressRing
            progress={userProgress}
            size="sm"
            color="blue"
            showText={false}
          >
            <div className="flex flex-col items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-bold text-slate-300">
                {userLevel}
              </span>
            </div>
          </ProgressRing>
        </motion.div>

        {/* Central Hub Button */}
        <motion.button
          className={cn(
            "relative w-16 h-16 rounded-full bg-gradient-to-r from-slate-800 to-slate-700",
            "border-2 border-slate-600 shadow-xl flex items-center justify-center",
            "hover:from-slate-700 hover:to-slate-600 transition-all duration-200",
            "backdrop-blur-sm z-20"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          animate={{
            borderColor: isOpen ? "rgb(99 102 241)" : "rgb(71 85 105)",
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-300" />
            )}
          </motion.div>

          {/* Notification Dot */}
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center z-30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy className="w-2 h-2 text-white" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};
