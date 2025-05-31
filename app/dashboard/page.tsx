import { format } from "date-fns"
import { DashboardView } from "@/components/dashboard-view"

export default function DashboardPage() {
  const today = new Date()

  return (
    <div className="container py-4 sm:py-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Today, {format(today, "MMMM d")}</h1>
      </div>
      <DashboardView />
    </div>
  )
}
