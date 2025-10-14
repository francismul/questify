"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  QuestionResponse,
  QuestionData,
  createQuestion,
  updateQuestion,
} from "@/lib/auth-actions";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  question?: QuestionResponse | null;
  onSuccess: () => void;
}

export function QuestionModal({
  isOpen,
  onClose,
  quizId,
  question,
  onSuccess,
}: QuestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<QuestionData>({
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correct_answer: 0,
    explanation: "",
    points: 1,
    order: 1,
  });

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question,
        type: question.type,
        options: [...question.options],
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        points: question.points,
        order: question.order,
      });
    } else {
      setFormData({
        question: "",
        type: "multiple-choice",
        options: ["", "", "", ""],
        correct_answer: 0,
        explanation: "",
        points: 1,
        order: 1,
      });
    }
  }, [question, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty options for multiple choice
      const filteredOptions =
        formData.type === "multiple-choice"
          ? formData.options.filter((option) => option.trim() !== "")
          : formData.options;

      const submitData = {
        ...formData,
        options: filteredOptions,
      };

      if (question) {
        // Update existing question
        await updateQuestion(question.id, submitData);
      } else {
        // Create new question
        await createQuestion(quizId, submitData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof QuestionData,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        options: newOptions,
        correct_answer:
          prev.correct_answer >= index && prev.correct_answer > 0
            ? prev.correct_answer - 1
            : prev.correct_answer,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {question ? "Edit Question" : "Add New Question"}
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
              Question
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              placeholder="Enter your question"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "multiple-choice" | "true-false"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points
              </label>
              <Input
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) =>
                  handleInputChange("points", parseInt(e.target.value))
                }
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
                onChange={(e) =>
                  handleInputChange("order", parseInt(e.target.value))
                }
                required
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options
              </label>
              {formData.type === "multiple-choice" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  Add Option
                </Button>
              )}
            </div>

            {formData.type === "true-false" ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={formData.correct_answer === 0}
                    onChange={() => handleInputChange("correct_answer", 0)}
                    className="mr-2"
                  />
                  <span>True</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={formData.correct_answer === 1}
                    onChange={() => handleInputChange("correct_answer", 1)}
                    className="mr-2"
                  />
                  <span>False</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={formData.correct_answer === index}
                      onChange={() =>
                        handleInputChange("correct_answer", index)
                      }
                      className="mr-2"
                    />
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange("explanation", e.target.value)}
              placeholder="Explain the correct answer"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : question
                ? "Update Question"
                : "Create Question"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
