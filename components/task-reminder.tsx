"use client"

import { useState } from "react"
import { format, addMinutes } from "date-fns"
import { Clock, SkipForward, CheckCircle2 } from "lucide-react"
import { type Task, updateTask } from "@/lib/tasks"
import { getUserAvailability } from "@/lib/availability"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface TaskReminderProps {
  task: Task
  onClose: () => void
  onComplete: () => void
}

export function TaskReminder({ task, onClose, onComplete }: TaskReminderProps) {
  const [showReschedule, setShowReschedule] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.scheduled_datetime ? new Date(task.scheduled_datetime) : undefined,
  )
  const [selectedTime, setSelectedTime] = useState(
    task.scheduled_datetime ? format(new Date(task.scheduled_datetime), "HH:mm") : "09:00",
  )
  const { toast } = useToast()
  const availability = getUserAvailability()

  // Handle snooze
  const handleSnooze = () => {
    const now = new Date()
    const snoozeTime = addMinutes(now, availability.defaultSnoozeMinutes)

    const updatedTask = {
      ...task,
      scheduled_datetime: snoozeTime.toISOString(),
      status: "snoozed" as const,
    }

    updateTask(updatedTask)

    toast({
      title: "Task snoozed",
      description: `"${task.task_name}" has been snoozed for ${availability.defaultSnoozeMinutes} minutes.`,
    })

    onClose()
  }

  // Handle skip to tomorrow
  const handleSkipToTomorrow = () => {
    const taskDate = new Date(task.scheduled_datetime!)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(taskDate.getHours(), taskDate.getMinutes(), 0, 0)

    const updatedTask = {
      ...task,
      scheduled_datetime: tomorrow.toISOString(),
      status: "skipped_today" as const,
    }

    updateTask(updatedTask)

    toast({
      title: "Task skipped",
      description: `"${task.task_name}" has been moved to tomorrow.`,
    })

    onClose()
  }

  // Handle reschedule
  const handleReschedule = () => {
    if (!selectedDate) return

    const [hours, minutes] = selectedTime.split(":").map(Number)
    const newDate = new Date(selectedDate)
    newDate.setHours(hours, minutes, 0, 0)

    const updatedTask = {
      ...task,
      scheduled_datetime: newDate.toISOString(),
    }

    updateTask(updatedTask)

    toast({
      title: "Task rescheduled",
      description: `"${task.task_name}" has been rescheduled to ${format(newDate, "PPP p")}.`,
    })

    onClose()
  }

  return (
    <>
      <AlertDialog open={!showReschedule} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reminder: {task.task_name}</AlertDialogTitle>
            <AlertDialogDescription>
              This task is scheduled to start at {format(new Date(task.scheduled_datetime!), "h:mm a")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={handleSnooze}>
              <Clock className="mr-2 h-4 w-4" />
              Snooze ({availability.defaultSnoozeMinutes} minutes)
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleSkipToTomorrow}>
              <SkipForward className="mr-2 h-4 w-4" />
              Skip to Tomorrow
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => setShowReschedule(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Set Specific Time
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Dismiss</AlertDialogCancel>
            <AlertDialogAction onClick={onComplete}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReschedule} onOpenChange={setShowReschedule}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Task</AlertDialogTitle>
            <AlertDialogDescription>Choose a new date and time for "{task.task_name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Time</label>
              <Input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReschedule(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReschedule} disabled={!selectedDate}>
              Reschedule Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
