"use client"

import { useState, useEffect } from "react"
import { format, addMinutes } from "date-fns"
import { CheckCircle2, Clock, List, CalendarIcon } from "lucide-react"
import { type Task, getTasksForDay, updateTask } from "@/lib/tasks"
import { getUserAvailability } from "@/lib/availability"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TaskReminder } from "@/components/task-reminder"
import { AddTaskButton } from "@/components/add-task-button"

export function DashboardView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewType, setViewType] = useState<"timeline" | "list">("timeline")
  const [reminderTask, setReminderTask] = useState<Task | null>(null)
  const { toast } = useToast()

  // Load tasks
  useEffect(() => {
    const loadTasks = () => {
      const todayTasks = getTasksForDay(new Date())
      setTasks(todayTasks)
    }

    loadTasks()
    const interval = setInterval(loadTasks, 60000)
    return () => clearInterval(interval)
  }, [])

  // Mark task as complete
  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const updatedTask = { ...task, status: "completed" as const }
      updateTask(updatedTask)
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))
      toast({
        title: "Task completed",
        description: `"${task.task_name}" has been marked as complete.`,
      })
    }
  }

  // Simulate a reminder for the next upcoming task
  useEffect(() => {
    const upcomingTasks = tasks
      .filter((task) => task.status === "pending" && new Date(task.scheduled_datetime!) > new Date())
      .sort((a, b) => new Date(a.scheduled_datetime!).getTime() - new Date(b.scheduled_datetime!).getTime())

    if (upcomingTasks.length > 0) {
      const nextTask = upcomingTasks[0]
      const taskTime = new Date(nextTask.scheduled_datetime!)
      const now = new Date()

      // Show reminder 5 minutes before task for demo purposes
      const reminderTime = new Date(taskTime.getTime() - 5 * 60 * 1000)

      if (reminderTime > now) {
        const timeoutId = setTimeout(() => {
          setReminderTask(nextTask)
        }, reminderTime.getTime() - now.getTime())

        return () => clearTimeout(timeoutId)
      } else if (now < taskTime) {
        // If we're within the 5 minute window, show reminder immediately
        setReminderTask(nextTask)
      }
    }
  }, [tasks])

  // Get availability to determine timeline bounds
  const availability = getUserAvailability()
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase().slice(0, 3)
  const todaySlots = availability[today as keyof typeof availability] || []

  let startHour = 9
  let endHour = 17

  if (todaySlots.length > 0) {
    const allHours = todaySlots.flatMap((slot) => {
      const [startH] = slot.start.split(":").map(Number)
      const [endH] = slot.end.split(":").map(Number)
      return [startH, endH]
    })
    startHour = Math.min(...allHours)
    endHour = Math.max(...allHours)
  }

  const hourMarkers = []
  for (let hour = startHour; hour <= endHour; hour++) {
    hourMarkers.push(hour)
  }

  const getTaskStyle = (task: Task) => {
    const taskStart = new Date(task.scheduled_datetime!)
    const taskStartHour = taskStart.getHours()
    const taskStartMinute = taskStart.getMinutes()
    const taskEnd = addMinutes(taskStart, task.duration_minutes)

    const timelineStart = startHour * 60
    const timelineEnd = endHour * 60
    const timelineRange = timelineEnd - timelineStart

    const taskStartMinutes = taskStartHour * 60 + taskStartMinute
    const taskEndMinutes = taskEnd.getHours() * 60 + taskEnd.getMinutes()

    const topPercentage = ((taskStartMinutes - timelineStart) / timelineRange) * 100
    const heightPercentage = ((taskEndMinutes - taskStartMinutes) / timelineRange) * 100

    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`,
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-gray-200 border-gray-300"
      case 2:
        return "bg-blue-200 border-blue-300"
      case 3:
        return "bg-yellow-200 border-yellow-300"
      case 4:
        return "bg-orange-200 border-orange-300"
      case 5:
        return "bg-red-200 border-red-300"
      default:
        return "bg-gray-200 border-gray-300"
    }
  }

  const getCurrentTimePosition = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const timelineStart = startHour * 60
    const timelineEnd = endHour * 60
    const timelineRange = timelineEnd - timelineStart
    const currentTimeMinutes = currentHour * 60 + currentMinute
    const percentage = ((currentTimeMinutes - timelineStart) / timelineRange) * 100
    return { top: `${percentage}%` }
  }

  const hasTasks = tasks.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={viewType === "timeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("timeline")}
            className="flex-1 sm:flex-none"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          <Button
            variant={viewType === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewType("list")}
            className="flex-1 sm:flex-none"
          >
            <List className="mr-2 h-4 w-4" />
            List
          </Button>
        </div>

        <div className="sm:hidden w-full">
          <AddTaskButton />
        </div>
      </div>

      {!hasTasks ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 border rounded-lg text-center">
          <p className="text-lg text-muted-foreground mb-4">
            No tasks scheduled for today. Enjoy your free day or add a new task!
          </p>
          <AddTaskButton />
        </div>
      ) : viewType === "timeline" ? (
        <div className="relative border rounded-lg p-2 sm:p-4 h-[400px] sm:h-[600px] overflow-hidden">
          {/* Hour markers */}
          {hourMarkers.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-200 text-xs text-gray-500 pl-2"
              style={{
                top: `${((hour - startHour) / (endHour - startHour)) * 100}%`,
              }}
            >
              <span className="bg-background px-1">
                {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </span>
            </div>
          ))}

          {/* Current time indicator */}
          <div className="absolute left-0 right-0 border-t-2 border-red-500 z-10" style={getCurrentTimePosition()}>
            <div className="absolute -top-2.5 -left-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
              <Clock className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Tasks */}
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "absolute left-8 sm:left-16 right-2 sm:right-4 rounded-md p-2 shadow-sm transition-all border",
                task.status === "completed" ? "opacity-50" : "opacity-100",
                getPriorityColor(task.priority),
              )}
              style={getTaskStyle(task)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className={cn("font-medium text-sm truncate", task.status === "completed" && "line-through")}>
                    {task.task_name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {format(new Date(task.scheduled_datetime!), "h:mm a")} -
                    {format(addMinutes(new Date(task.scheduled_datetime!), task.duration_minutes), "h:mm a")}
                  </p>
                  {task.task_details && (
                    <p className="text-xs mt-1 text-gray-700 line-clamp-2 hidden sm:block">{task.task_details}</p>
                  )}
                </div>
                {task.status !== "completed" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => completeTask(task.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn("flex items-center justify-between p-4 gap-4", task.status === "completed" && "bg-gray-50")}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full flex-shrink-0", task.status === "completed" && "bg-green-100")}
                  onClick={() => completeTask(task.id)}
                  disabled={task.status === "completed"}
                >
                  <CheckCircle2
                    className={cn("h-5 w-5", task.status === "completed" ? "text-green-500" : "text-gray-400")}
                  />
                </Button>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn("font-medium truncate", task.status === "completed" && "line-through text-gray-500")}
                  >
                    {task.task_name}
                  </p>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mt-1">
                    <span>{format(new Date(task.scheduled_datetime!), "h:mm a")}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{task.duration_minutes} min</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          task.priority === 1 && "bg-gray-400",
                          task.priority === 2 && "bg-blue-400",
                          task.priority === 3 && "bg-yellow-400",
                          task.priority === 4 && "bg-orange-400",
                          task.priority === 5 && "bg-red-400",
                        )}
                      />
                      <span className="hidden sm:inline">Priority {task.priority}</span>
                      <span className="sm:hidden">P{task.priority}</span>
                    </span>
                  </div>
                  {task.task_details && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2 sm:hidden">{task.task_details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reminderTask && (
        <TaskReminder
          task={reminderTask}
          onClose={() => setReminderTask(null)}
          onComplete={() => {
            completeTask(reminderTask.id)
            setReminderTask(null)
          }}
        />
      )}
    </div>
  )
}
