"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskFormModal } from "@/components/task-form-modal"

export function AddTaskButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="mr-2 h-4 w-4" /> Add Task
      </Button>
      <TaskFormModal open={open} onOpenChange={setOpen} />
    </>
  )
}
