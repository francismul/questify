"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QuizResponse, QuizData, createQuiz, updateQuiz, ChapterResponse } from "@/lib/auth-actions";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  quiz?: QuizResponse | null;
  onSuccess: () => void;
  chapters: ChapterResponse[];
}

export function QuizModal({
  isOpen,
  onClose,
  courseId,
  quiz,
  onSuccess,
  chapters,
}: QuizModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuizData>({
    title: "",
    description: "",
    chapter: "",
    time_limit: undefined,
    passing_score: 70,
    max_attempts: 3,
    type: 'chapter',
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description,
        chapter: quiz.chapter || "",
        time_limit: quiz.time_limit || undefined,
        passing_score: quiz.passing_score,
        max_attempts: quiz.max_attempts,
        type: quiz.type,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        chapter: "",
        time_limit: undefined,
        passing_score: 70,
        max_attempts: 3,
        type: 'chapter',
      });
    }
  }, [quiz, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        chapter: formData.chapter || undefined, // Convert empty string to undefined
      };

      if (quiz) {
        // Update existing quiz
        await updateQuiz(quiz.id, submitData);
      } else {
        // Create new quiz
        await createQuiz(courseId, submitData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof QuizData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {quiz ? "Edit Quiz" : "Add New Quiz"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter quiz description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quiz Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value as 'chapter' | 'final')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-card"
                required
              >
                <option value="chapter">Chapter Quiz</option>
                <option value="final">Final Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Chapter (Optional)
              </label>
              <select
                value={formData.chapter}
                onChange={(e) => handleInputChange("chapter", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No specific chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.order}. {chapter.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.time_limit || ""}
                onChange={(e) => handleInputChange("time_limit", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.passing_score}
                onChange={(e) => handleInputChange("passing_score", parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <Input
                type="number"
                min="1"
                value={formData.max_attempts}
                onChange={(e) => handleInputChange("max_attempts", parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : quiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}