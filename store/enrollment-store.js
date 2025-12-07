"use client"

import { create } from "zustand"
import { getMyEnrollments } from "@/lib/api/enrollment"

export const useEnrollmentStore = create((set, get) => ({
    // State
    enrollments: [],
    loading: false,
    error: null,
    lastFetched: null, // Track when data was last fetched
    initialized: false, // Track if initial fetch has been attempted

    // Actions
    fetchEnrollments: async (force = false) => {
        const { enrollments, lastFetched } = get()
        
        // Skip fetch if data already exists and not forced
        if (!force && enrollments.length > 0 && lastFetched) {
            return
        }

        set({ loading: true, error: null })
        try {
            const response = await getMyEnrollments()

            if (response.success) {
                set({
                    enrollments: response.data || [],
                    loading: false,
                    lastFetched: Date.now(),
                    initialized: true,
                })
            } else {
                set({
                    error: response.error || "Failed to fetch enrollments",
                    loading: false,
                    initialized: true,
                })
            }
        } catch (error) {
            console.error("Failed to fetch enrollments:", error)
            set({
                error: "Failed to fetch enrollments",
                loading: false,
                initialized: true,
            })
        }
    },

    clearEnrollments: () => {
        set({
            enrollments: [],
            error: null,
            lastFetched: null,
            initialized: false,
        })
    },

    // Force refresh enrollments (bypass cache)
    refreshEnrollments: async () => {
        const { fetchEnrollments } = get()
        await fetchEnrollments(true)
    },
}))
