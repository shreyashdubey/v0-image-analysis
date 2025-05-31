"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { addTask } from "@/lib/tasks"

interface ImportTask {
  datetime?: string
  task_name: string
  task_details?: string
  priority: number
  duration_minutes?: number
}

interface ImportData {
  tasks: ImportTask[]
}

export function ImportTasks() {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setImportResults(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setImportResults(null)

    try {
      const fileContent = await file.text()
      const data = JSON.parse(fileContent) as ImportData

      // Validate structure
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error("Invalid JSON format. Expected a 'tasks' array.")
      }

      const results = {
        success: 0,
        errors: [] as string[],
      }

      // Process each task
      for (let i = 0; i < data.tasks.length; i++) {
        const importTask = data.tasks[i]

        try {
          // Validate required fields
          if (!importTask.task_name) {
            throw new Error(`Task ${i + 1}: Missing required field 'task_name'.`)
          }

          if (typeof importTask.priority !== "number" || importTask.priority < 1 || importTask.priority > 5) {
            throw new Error(`Task ${i + 1}: Invalid 'priority'. Must be a number between 1 and 5.`)
          }

          // Create task object
          const task = {
            id: `task_import_${Date.now()}_${i}`,
            userId: "demoUser",
            task_name: importTask.task_name,
            task_details: importTask.task_details || "",
            duration_minutes: importTask.duration_minutes || 30,
            priority: importTask.priority,
            scheduled_datetime: importTask.datetime,
            status: "pending" as const,
          }

          // Add task to store
          addTask(task)
          results.success++
        } catch (error) {
          if (error instanceof Error) {
            results.errors.push(error.message)
          } else {
            results.errors.push(`Task ${i + 1}: Unknown error.`)
          }
        }
      }

      setImportResults(results)

      if (results.success > 0) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${results.success} tasks.`,
        })
      }
    } catch (error) {
      let errorMessage = "Failed to parse JSON file."
      if (error instanceof Error) {
        errorMessage = error.message
      }

      setImportResults({
        success: 0,
        errors: [errorMessage],
      })

      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-muted-foreground mb-6">
        Upload a JSON file with your tasks. See below for the required format.
      </p>

      <div className="mb-8">
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-lg font-medium mb-1">{file ? file.name : "Choose a file"}</p>
            <p className="text-sm text-muted-foreground">{file ? "Click to change file" : "or drag and drop"}</p>
          </label>
        </div>

        <div className="mt-4 flex justify-center">
          <Button onClick={handleImport} disabled={!file || isImporting} className="w-full max-w-xs">
            {isImporting ? "Importing..." : "Import Tasks"}
          </Button>
        </div>
      </div>

      {importResults && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Import Results</h3>
            <p className="mb-2">Successfully imported {importResults.success} tasks.</p>

            {importResults.errors.length > 0 && (
              <div>
                <p className="font-medium text-red-500 mb-1">Errors:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {importResults.errors.map((error, i) => (
                    <li key={i} className="text-red-500">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importResults.success > 0 && (
              <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
                View Tasks in Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Expected JSON Format</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {`{
  "tasks": [
    {
      "datetime": "2025-06-01T14:00:00", // Optional, ISO 8601
      "task_name": "Study for Exam",
      "task_details": "Revise chapters 4-6 from textbook", // Optional
      "priority": 2, // Integer, e.g., 1-5
      "duration_minutes": 90 // Optional, defaults to 30 if not present
    },
    // ... more tasks
  ]
}`}
        </pre>
      </div>
    </div>
  )
}
