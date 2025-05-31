"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { type TimeSlot, type UserAvailability, getUserAvailability, updateAvailability } from "@/lib/availability"

export function AvailabilitySettings() {
  const [availability, setAvailability] = useState<UserAvailability>(getUserAvailability())
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [defaultSnooze, setDefaultSnooze] = useState(availability.defaultSnoozeMinutes.toString())
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const storedAvailability = getUserAvailability()
    setAvailability(storedAvailability)
    setDefaultSnooze(storedAvailability.defaultSnoozeMinutes.toString())
  }, [])

  const handleSave = () => {
    const updatedAvailability = {
      ...availability,
      defaultSnoozeMinutes: Number.parseInt(defaultSnooze),
    }

    updateAvailability(updatedAvailability)
    toast({
      title: "Settings saved",
      description: "Your availability settings have been updated.",
    })
    router.refresh()
  }

  const toggleDayAvailability = (day: keyof Omit<UserAvailability, "defaultSnoozeMinutes">) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].length > 0 ? [] : [{ start: "09:00", end: "17:00" }],
    }))
  }

  const openSlotEditor = (day: string, slot: TimeSlot | null, index: number | null) => {
    setEditingDay(day)
    setEditingSlot(slot ? { ...slot } : { start: "09:00", end: "17:00" })
    setEditingIndex(index)
  }

  const closeSlotEditor = () => {
    setEditingDay(null)
    setEditingSlot(null)
    setEditingIndex(null)
  }

  const saveTimeSlot = () => {
    if (!editingDay || !editingSlot) return

    const day = editingDay as keyof Omit<UserAvailability, "defaultSnoozeMinutes">

    setAvailability((prev) => {
      const updatedSlots = [...prev[day]]

      if (editingIndex !== null) {
        updatedSlots[editingIndex] = editingSlot
      } else {
        updatedSlots.push(editingSlot)
      }

      return {
        ...prev,
        [day]: updatedSlots,
      }
    })

    closeSlotEditor()
  }

  const deleteTimeSlot = (day: keyof Omit<UserAvailability, "defaultSnoozeMinutes">, index: number) => {
    setAvailability((prev) => {
      const updatedSlots = [...prev[day]]
      updatedSlots.splice(index, 1)
      return {
        ...prev,
        [day]: updatedSlots,
      }
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-muted-foreground mb-6">
        Define your free hours for each day. Momentum will use these to schedule your tasks automatically.
      </p>

      <div className="space-y-4 mb-8">
        {days.map(({ key, label }) => (
          <Card key={key}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={availability[key as keyof Omit<UserAvailability, "defaultSnoozeMinutes">].length > 0}
                    onCheckedChange={() =>
                      toggleDayAvailability(key as keyof Omit<UserAvailability, "defaultSnoozeMinutes">)
                    }
                    id={`available-${key}`}
                  />
                  <Label htmlFor={`available-${key}`} className="text-base sm:text-lg font-medium">
                    Available on {label}?
                  </Label>
                </div>
              </div>

              {availability[key as keyof Omit<UserAvailability, "defaultSnoozeMinutes">].length > 0 ? (
                <div className="space-y-3">
                  {availability[key as keyof Omit<UserAvailability, "defaultSnoozeMinutes">].map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="text-sm sm:text-base">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openSlotEditor(key, slot, index)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteTimeSlot(key as keyof Omit<UserAvailability, "defaultSnoozeMinutes">, index)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full sm:w-auto"
                    onClick={() => openSlotEditor(key, null, null)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Time Slot
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Not available on this day.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-medium mb-4">Global Settings</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Label htmlFor="default-snooze" className="sm:min-w-32">
              Default Snooze Duration:
            </Label>
            <Select value={defaultSnooze} onValueChange={setDefaultSnooze}>
              <SelectTrigger id="default-snooze" className="w-full sm:w-40">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Dialog open={!!editingDay} onOpenChange={(open) => !open && closeSlotEditor()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? "Edit Time Slot" : "Add Time Slot"}</DialogTitle>
            <DialogDescription>Set the start and end times for this availability slot.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={editingSlot?.start || ""}
                  onChange={(e) => setEditingSlot((prev) => (prev ? { ...prev, start: e.target.value } : null))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={editingSlot?.end || ""}
                  onChange={(e) => setEditingSlot((prev) => (prev ? { ...prev, end: e.target.value } : null))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={closeSlotEditor} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={saveTimeSlot} className="w-full sm:w-auto">
              Save Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
