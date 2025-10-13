"use client"

import { useState } from "react"
import { CourseForm } from "./CourseForm"
import { X } from "lucide-react"

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  title: string
  submitLabel?: string
}

export function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitLabel
}: CourseModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error("Error submitting course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <CourseForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  )
}