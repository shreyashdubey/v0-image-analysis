import { ImportTasks } from "@/components/import-tasks"

export default function ImportPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Import Tasks from JSON</h1>
      <ImportTasks />
    </div>
  )
}
