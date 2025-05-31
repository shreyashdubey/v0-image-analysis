"use client"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { addTask } from "@/lib/tasks"

const formSchema = z.object({
  task_name: z.string().min(1, "Task name is required"),
  task_details: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1"),
  duration_unit: z.enum(["minutes", "hours"]),
  priority: z.number().min(1).max(5),
  datetime: z.date().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function TaskFormModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task_name: "",
      task_details: "",
      duration: 30,
      duration_unit: "minutes",
      priority: 3,
    },
  })

  function onSubmit(values: FormValues) {
    try {
      // Calculate duration in minutes
      const duration_minutes = values.duration_unit === "hours" ? values.duration * 60 : values.duration

      // Create task object
      const task = {
        id: `task_${Date.now()}`,
        userId: "demoUser",
        task_name: values.task_name,
        task_details: values.task_details || "",
        duration_minutes,
        priority: values.priority,
        scheduled_datetime: values.datetime ? values.datetime.toISOString() : undefined,
        status: "pending" as const,
      }

      // Add task to store
      addTask(task)

      // Show success message
      toast({
        title: "Task added",
        description: "Your task has been successfully added.",
      })

      // Close modal and refresh
      onOpenChange(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task to be scheduled in your free time.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="task_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Finish project proposal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Include market research and competitor analysis."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Low (1)</SelectItem>
                      <SelectItem value="2">Medium (2)</SelectItem>
                      <SelectItem value="3">High (3)</SelectItem>
                      <SelectItem value="4">Urgent (4)</SelectItem>
                      <SelectItem value="5">Critical (5)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule for specific time (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date)
                            if (field.value) {
                              newDate.setHours(field.value.getHours())
                              newDate.setMinutes(field.value.getMinutes())
                            } else {
                              const now = new Date()
                              newDate.setHours(now.getHours())
                              newDate.setMinutes(now.getMinutes())
                            }
                            field.onChange(newDate)
                          } else {
                            field.onChange(undefined)
                          }
                        }}
                        initialFocus
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <Input
                              type="time"
                              value={format(field.value, "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":")
                                const newDate = new Date(field.value!)
                                newDate.setHours(Number.parseInt(hours))
                                newDate.setMinutes(Number.parseInt(minutes))
                                field.onChange(newDate)
                              }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormDescription>If not specified, the task will be auto-scheduled.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
