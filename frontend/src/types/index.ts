export interface User {
  id: string
  email: string
  name: string
  role: 'guardian' | 'learner' | 'superuser' | 'system'
  familyId: string
  avatar?: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  objective: string
  difficulty: number
  expectedEffortMinutes: number
  deadline: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  proofType: 'text' | 'file' | 'quiz' | 'photo' | 'explanation'
  createdBy: string
  assignedTo: string
  familyId: string
  tags: string[]
  createdAt: string
  completedAt?: string
}

export interface Submission {
  id: string
  taskId: string
  submittedBy: string
  contentType: 'text' | 'file' | 'quiz' | 'photo' | 'explanation'
  content?: string
  fileUrls?: string[]
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'needs_revision' | 'rejected'
  attemptNumber: number
  isLate: boolean
  grade?: number
  maxGrade?: number
  feedback?: string
  reviewedBy?: string
  createdAt: string
  submittedAt?: string
  reviewedAt?: string
}

export interface Analytics {
  userId: string
  period: {
    from: string
    to: string
  }
  stats: {
    tasksAssigned: number
    tasksCompleted: number
    completionRate: number
    averageGrade: number
    onTimeCompletions: number
    lateCompletions: number
    currentStreak: number
    bestStreak: number
    totalTimeSpentMinutes: number
    averageTimeVsExpected: number
  }
}
