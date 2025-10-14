"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  ArrowRight,
  Brain,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Quiz } from "@/types";
import { cn } from "@/lib/utils";

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
  className?: string;
}

interface AnswerState {
  questionId: string;
  selectedAnswer: string;
  isCorrect?: boolean;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onComplete,
  className,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 300); // 5 minutes default
  const [quizStarted, setQuizStarted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  );

  // Timer effect
  React.useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleQuizComplete();
    }
  }, [timeLeft, quizStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResults) return;

    const newAnswer: AnswerState = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect: answer === String(currentQuestion.correctAnswer),
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleQuizComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const score = (correctAnswers / quiz.questions.length) * 100;
    setShowResults(true);
    onComplete(score);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(quiz.timeLimit || 300);
    setQuizStarted(false);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden",
            className
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                  <p className="text-sm text-slate-400">
                    {quiz.questions.length} questions •{" "}
                    {Math.ceil((quiz.timeLimit || 300) / 60)} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {quizStarted && !showResults && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!quizStarted ? (
              // Quiz intro
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Ready to test your knowledge?
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    This quiz contains {quiz.questions.length} questions and
                    should take about {Math.ceil((quiz.timeLimit || 300) / 60)}{" "}
                    minutes to complete.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-sm text-slate-400">
                    • You can navigate between questions freely
                  </div>
                  <div className="text-sm text-slate-400">
                    • Make sure to answer all questions before time runs out
                  </div>
                  <div className="text-sm text-slate-400">
                    • You'll see your results immediately after completion
                  </div>
                </div>

                <Button
                  variant="glow"
                  onClick={startQuiz}
                  className="px-8 py-3"
                >
                  Start Quiz
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : showResults ? (
              // Results view
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Award className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Quiz Complete!
                  </h3>
                  <p className="text-slate-400">
                    You scored {answers.filter((a) => a.isCorrect).length} out
                    of {quiz.questions.length} questions correctly
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(
                      (answers.filter((a) => a.isCorrect).length /
                        quiz.questions.length) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-slate-400">Final Score</div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleRetry}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Quiz
                  </Button>
                  <Button variant="glow" onClick={onClose}>
                    Continue Learning
                  </Button>
                </div>
              </motion.div>
            ) : (
              // Question view
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((currentQuestionIndex + 1) / quiz.questions.length) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>
                    Question {currentQuestionIndex + 1} of{" "}
                    {quiz.questions.length}
                  </span>
                  <span>{answers.length} answered</span>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected =
                        currentAnswer?.selectedAnswer === option;
                      const letter = String.fromCharCode(65 + index); // A, B, C, D

                      return (
                        <motion.button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3",
                            isSelected
                              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                              : "bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                          )}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-slate-600 text-slate-300"
                            )}
                          >
                            {letter}
                          </div>
                          <div className="flex-1 pt-1">{option}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="disabled:opacity-50"
                  >
                    Previous
                  </Button>

                  <Button
                    variant="glow"
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className="disabled:opacity-50"
                  >
                    {isLastQuestion ? "Complete Quiz" : "Next Question"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
