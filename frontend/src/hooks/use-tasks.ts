import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { Task } from '@/types'
import toast from 'react-hot-toast'

interface CreateTaskDto {
  title: string
  description: string
  objective: string
  difficulty: number
  expectedEffortMinutes: number
  deadline: string
  proofType: string
  assignedTo: string
  tags?: string[]
}

export function useTasks(filters?: any) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/tasks', { params: filters })
      return data
    },
  })
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tasks/${taskId}`)
      return data as Task
    },
    enabled: !!taskId,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskData: CreateTaskDto) => {
      const { data } = await apiClient.post('/tasks', taskData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create task')
    },
  })
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const { data } = await apiClient.patch(`/tasks/${taskId}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })
      toast.success('Task updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update task')
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      await apiClient.delete(`/tasks/${taskId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    },
  })
}
