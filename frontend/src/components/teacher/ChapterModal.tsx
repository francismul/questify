"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChapterResponse, ChapterData, createChapter, updateChapter } from "@/lib/auth-actions";

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  chapter?: ChapterResponse | null;
  onSuccess: () => void;
  existingChapters: ChapterResponse[];
}

export function ChapterModal({
  isOpen,
  onClose,
  courseId,
  chapter,
  onSuccess,
  existingChapters,
}: ChapterModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChapterData>({
    title: "",
    content: "",
    order: 1,
    estimated_minutes: 30,
  });

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        estimated_minutes: chapter.estimated_minutes,
      });
    } else {
      // For new chapters, set order to next available
      const maxOrder = existingChapters.length > 0
        ? Math.max(...existingChapters.map(c => c.order))
        : 0;
      setFormData({
        title: "",
        content: "",
        order: maxOrder + 1,
        estimated_minutes: 30,
      });
    }
  }, [chapter, existingChapters, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (chapter) {
        // Update existing chapter
        await updateChapter(chapter.id, formData);
      } else {
        // Create new chapter
        await createChapter(courseId, formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving chapter:", error);
      alert("Failed to save chapter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ChapterData, value: string | number) => {
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
            {chapter ? "Edit Chapter" : "Add New Chapter"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter chapter title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <Input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes)
            </label>
            <Input
              type="number"
              min="1"
              value={formData.estimated_minutes}
              onChange={(e) => handleInputChange("estimated_minutes", parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chapter Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Enter chapter content (supports markdown)"
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : chapter ? "Update Chapter" : "Create Chapter"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}