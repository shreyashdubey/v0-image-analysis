import { AvailabilitySettings } from "@/components/availability-settings"

export default function SettingsPage() {
  return (
    <div className="container py-4 sm:py-6 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Availability Settings</h1>
      <AvailabilitySettings />
    </div>
  )
}
