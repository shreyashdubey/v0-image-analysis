"use client"

export interface TimeSlot {
  start: string // Format: "HH:MM" (24-hour)
  end: string // Format: "HH:MM" (24-hour)
}

export interface UserAvailability {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
  defaultSnoozeMinutes: number
}

// Initial mock data
const initialAvailability: UserAvailability = {
  monday: [
    { start: "09:00", end: "12:00" },
    { start: "13:00", end: "17:00" },
  ],
  tuesday: [{ start: "10:00", end: "15:00" }],
  wednesday: [{ start: "09:00", end: "12:30" }],
  thursday: [{ start: "14:00", end: "18:00" }],
  friday: [{ start: "09:00", end: "16:00" }],
  saturday: [],
  sunday: [{ start: "13:00", end: "17:00" }],
  defaultSnoozeMinutes: 15,
}

// Store availability in localStorage if available
const storeAvailability = (availability: UserAvailability) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("momentum_availability", JSON.stringify(availability))
  }
}

// Get availability from localStorage or use initial data
export const getUserAvailability = (): UserAvailability => {
  if (typeof window !== "undefined") {
    const storedAvailability = localStorage.getItem("momentum_availability")
    if (storedAvailability) {
      return JSON.parse(storedAvailability)
    }
    // Store initial availability if none exists
    storeAvailability(initialAvailability)
  }
  return initialAvailability
}

// Update availability
export const updateAvailability = (availability: UserAvailability) => {
  storeAvailability(availability)
  return availability
}

// Update a specific day's availability
export const updateDayAvailability = (day: keyof Omit<UserAvailability, "defaultSnoozeMinutes">, slots: TimeSlot[]) => {
  const availability = getUserAvailability()
  availability[day] = slots
  storeAvailability(availability)
  return availability
}

// Update default snooze duration
export const updateDefaultSnooze = (minutes: number) => {
  const availability = getUserAvailability()
  availability.defaultSnoozeMinutes = minutes
  storeAvailability(availability)
  return availability
}
