"use client"

import { getUserAvailability } from "./availability"

export interface Task {
  id: string
  userId: string
  task_name: string
  task_details: string
  duration_minutes: number
  priority: number
  scheduled_datetime?: string
  status: "pending" | "completed" | "snoozed" | "skipped_today"
}

// Initial mock data
const initialTasks: Task[] = [
  {
    id: "task_001",
    userId: "demoUser",
    task_name: "Morning Stand-up Meeting",
    task_details: "Quick sync with the team.",
    duration_minutes: 30,
    priority: 4,
    scheduled_datetime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    status: "pending",
  },
  {
    id: "task_002",
    userId: "demoUser",
    task_name: "Work on Feature X",
    task_details: "Implement the core logic for Feature X.",
    duration_minutes: 120,
    priority: 3,
    scheduled_datetime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    status: "pending",
  },
  {
    id: "task_003",
    userId: "demoUser",
    task_name: "Lunch Break",
    task_details: "",
    duration_minutes: 60,
    priority: 1,
    scheduled_datetime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    status: "completed",
  },
  {
    id: "task_004",
    userId: "demoUser",
    task_name: "Client Call",
    task_details: "Discuss project milestones with Client Y.",
    duration_minutes: 45,
    priority: 5,
    scheduled_datetime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    status: "pending",
  },
  {
    id: "task_005",
    userId: "demoUser",
    task_name: "Review Pull Request",
    task_details: "Check PR #123 from Bob.",
    duration_minutes: 60,
    priority: 3,
    scheduled_datetime: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
    status: "pending",
  },
  {
    id: "task_006",
    userId: "demoUser",
    task_name: "Plan Tomorrow's Tasks",
    task_details: "Prepare to-do list for Tuesday.",
    duration_minutes: 30,
    priority: 2,
    scheduled_datetime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    status: "pending",
  },
]

// Store tasks in localStorage if available
const storeTasks = (tasks: Task[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("momentum_tasks", JSON.stringify(tasks))
  }
}

// Get tasks from localStorage or use initial data
export const getTasks = (): Task[] => {
  if (typeof window !== "undefined") {
    const storedTasks = localStorage.getItem("momentum_tasks")
    if (storedTasks) {
      return JSON.parse(storedTasks)
    }
    // Store initial tasks if none exist
    storeTasks(initialTasks)
  }
  return initialTasks
}

// Get tasks for a specific day
export const getTasksForDay = (date: Date): Task[] => {
  const tasks = getTasks()
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return tasks.filter((task) => {
    if (!task.scheduled_datetime) return false
    const taskDate = new Date(task.scheduled_datetime)
    return taskDate >= startOfDay && taskDate <= endOfDay
  })
}

// Add a new task
export const addTask = (task: Task) => {
  // If no scheduled time, auto-schedule
  if (!task.scheduled_datetime) {
    task.scheduled_datetime = autoScheduleTask(task)
  }

  const tasks = getTasks()
  tasks.push(task)
  storeTasks(tasks)
  return task
}

// Update a task
export const updateTask = (updatedTask: Task) => {
  const tasks = getTasks()
  const index = tasks.findIndex((task) => task.id === updatedTask.id)

  if (index !== -1) {
    tasks[index] = updatedTask
    storeTasks(tasks)
    return updatedTask
  }

  return null
}

// Delete a task
export const deleteTask = (taskId: string) => {
  const tasks = getTasks()
  const filteredTasks = tasks.filter((task) => task.id !== taskId)
  storeTasks(filteredTasks)
}

// Auto-schedule a task based on availability
export const autoScheduleTask = (task: Task): string => {
  const availability = getUserAvailability()
  const today = new Date()
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase().slice(0, 3)

  // Get today's availability slots
  const todaySlots = availability[dayOfWeek as keyof typeof availability] || []

  // Get all tasks for today
  const todayTasks = getTasksForDay(today)

  // Find the first available slot
  for (const slot of todaySlots) {
    const startTime = new Date(today)
    const [startHour, startMinute] = slot.start.split(":").map(Number)
    startTime.setHours(startHour, startMinute, 0, 0)

    const endTime = new Date(today)
    const [endHour, endMinute] = slot.end.split(":").map(Number)
    endTime.setHours(endHour, endMinute, 0, 0)

    // Skip if slot is in the past
    if (startTime < new Date()) {
      continue
    }

    // Check if there's enough time in this slot
    const slotDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    if (slotDuration < task.duration_minutes) {
      continue
    }

    // Check for conflicts with existing tasks
    let hasConflict = false
    const taskEndTime = new Date(startTime.getTime() + task.duration_minutes * 60 * 1000)

    for (const existingTask of todayTasks) {
      if (!existingTask.scheduled_datetime) continue

      const existingStart = new Date(existingTask.scheduled_datetime)
      const existingEnd = new Date(existingStart.getTime() + existingTask.duration_minutes * 60 * 1000)

      // Check if there's an overlap
      if (
        (startTime >= existingStart && startTime < existingEnd) ||
        (taskEndTime > existingStart && taskEndTime <= existingEnd) ||
        (startTime <= existingStart && taskEndTime >= existingEnd)
      ) {
        hasConflict = true
        // Move start time to after this task
        startTime.setTime(existingEnd.getTime())
        taskEndTime.setTime(startTime.getTime() + task.duration_minutes * 60 * 1000)

        // Check if we're still within the slot
        if (taskEndTime > endTime) {
          hasConflict = true
          break
        } else {
          // We found a new potential start time, reset conflict flag
          hasConflict = false
        }
      }
    }

    // If no conflict, schedule at this time
    if (!hasConflict) {
      return startTime.toISOString()
    }
  }

  // If no slot found today, schedule for tomorrow at the first available slot
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(9, 0, 0, 0) // Default to 9 AM tomorrow

  return tomorrow.toISOString()
}
