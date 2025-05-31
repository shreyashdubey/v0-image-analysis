"use client"

import { useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Task, getTasksForDay } from "@/lib/tasks"
import { cn } from "@/lib/utils"

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
    const tasks = getTasksForDay(today)
    setSelectedTasks(tasks)
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    const tasks = getTasksForDay(day)
    setSelectedTasks(tasks)
  }

  const getTaskCount = (day: Date) => {
    const tasks = getTasksForDay(day)
    return tasks.length
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={prevMonth} className="flex-shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="flex-1 sm:flex-none">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="flex-shrink-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}

          {monthDays.map((day, i) => {
            const taskCount = getTaskCount(day)
            return (
              <div
                key={i}
                className={cn(
                  "h-16 sm:h-24 border rounded-md p-1 cursor-pointer hover:bg-gray-50 transition-colors",
                  !isSameMonth(day, currentMonth) && "opacity-50",
                  isSameDay(day, selectedDate) && "border-primary bg-primary/5",
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex flex-col h-full">
                  <div className="text-right text-sm">{format(day, "d")}</div>
                  {taskCount > 0 && (
                    <div className="mt-auto">
                      <div className="flex gap-1 flex-wrap justify-center">
                        {taskCount <= 3 ? (
                          Array(taskCount)
                            .fill(0)
                            .map((_, i) => (
                              <div key={i} className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                            ))
                        ) : (
                          <div className="text-xs font-medium text-primary">{taskCount}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-full lg:w-80 border rounded-lg p-4">
        <h3 className="font-medium mb-2">{format(selectedDate, "MMMM d, yyyy")}</h3>

        {selectedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks scheduled for this day.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedTasks.map((task) => (
              <div key={task.id} className="border rounded-md p-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full flex-shrink-0",
                      task.priority === 1 && "bg-gray-400",
                      task.priority === 2 && "bg-blue-400",
                      task.priority === 3 && "bg-yellow-400",
                      task.priority === 4 && "bg-orange-400",
                      task.priority === 5 && "bg-red-400",
                    )}
                  />
                  <p className={cn("font-medium text-sm", task.status === "completed" && "line-through")}>
                    {task.task_name}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(task.scheduled_datetime!), "h:mm a")} • {task.duration_minutes} min
                </div>
                {task.task_details && <p className="text-sm mt-2 line-clamp-3">{task.task_details}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
