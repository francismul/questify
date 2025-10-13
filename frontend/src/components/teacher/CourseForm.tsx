"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { X, Plus } from "lucide-react"

interface CourseFormData {
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimated_hours: number
  color: string
  thumbnail?: File | string
  tags: string[]
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>
  onSubmit: (data: CourseFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const COLOR_OPTIONS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Yellow" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#06B6D4", label: "Cyan" },
]

export function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = "Create Course"
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    difficulty: initialData?.difficulty || "beginner",
    estimated_hours: initialData?.estimated_hours || 10,
    color: initialData?.color || "#3B82F6",
    thumbnail: initialData?.thumbnail || "",
    tags: initialData?.tags || [],
  })

  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.estimated_hours <= 0) {
      newErrors.estimated_hours = "Estimated hours must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting course form:", error)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Course Title *
        </label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter course title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter course description"
          rows={4}
          className={`w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Difficulty and Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-foreground mb-2">
            Difficulty Level
          </label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              difficulty: e.target.value as "beginner" | "intermediate" | "advanced"
            }))}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {DIFFICULTY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-foreground mb-2">
            Estimated Hours *
          </label>
          <Input
            id="estimatedHours"
            type="number"
            min="1"
            value={formData.estimated_hours}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              estimated_hours: parseInt(e.target.value) || 0
            }))}
            className={errors.estimated_hours ? "border-red-500" : ""}
          />
          {errors.estimated_hours && (
            <p className="text-sm text-red-500 mt-1">{errors.estimated_hours}</p>
          )}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Course Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color.value ? "border-foreground" : "border-muted"
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium text-foreground mb-2">
          Course Thumbnail (Optional)
        </label>
        <Input
          id="thumbnail"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setFormData(prev => ({ ...prev, thumbnail: file }))
          }}
        />
        {typeof formData.thumbnail === 'string' && formData.thumbnail && (
          <p className="text-sm text-muted-foreground mt-1">
            Current: {formData.thumbnail}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2 flex-wrap">
          {formData.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-accent-foreground rounded-md text-sm">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag"
            className="flex-1"
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}