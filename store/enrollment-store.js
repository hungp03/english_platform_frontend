"use client"

import { create } from "zustand"
import { getMyEnrollments } from "@/lib/api/enrollment"

export const useEnrollmentStore = create((set, get) => ({
    // State
    enrollments: [],
    pagination: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
    },
    loading: false,
    error: null,
    lastFetched: null, // Track when data was last fetched
    initialized: false, // Track if initial fetch has been attempted

    // Actions
    fetchEnrollments: async (page = 1, pageSize = 10, force = false) => {
        const { pagination: currentPagination, enrollments, lastFetched } = get()
        
        // Skip fetch if data already exists for the requested page/size and not forced
        if (
            !force &&
            enrollments.length > 0 &&
            currentPagination.page === page &&
            currentPagination.pageSize === pageSize &&
            lastFetched
        ) {
            return
        }

        set({ loading: true, error: null })
        try {
            const response = await getMyEnrollments({
                page,
                size: pageSize,
            })

            if (response.success) {
                set({
                    enrollments: response.data.result || [],
                    pagination: {
                        page: response.data.meta?.page || 1,
                        pageSize: response.data.meta?.pageSize || 10,
                        pages: response.data.meta?.pages || 0,
                        total: response.data.meta?.total || 0,
                    },
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

    setPage: (page) => {
        const { pagination } = get()
        get().fetchEnrollments(page, pagination.pageSize)
    },

    clearEnrollments: () => {
        set({
            enrollments: [],
            pagination: {
                page: 1,
                pageSize: 10,
                pages: 0,
                total: 0,
            },
            error: null,
            lastFetched: null,
            initialized: false,
        })
    },

    // Force refresh enrollments (bypass cache)
    refreshEnrollments: async (page = 1, pageSize = 10) => {
        const { fetchEnrollments } = get()
        await fetchEnrollments(page, pageSize, true)
    },
}))
