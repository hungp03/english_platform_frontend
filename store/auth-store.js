'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getUser, updateUser } from '@/lib/api/user'
import { login as apiLogin, logout, logoutAll } from '@/lib/api/auth'

// Import cart store for clearing cart during logout
import { useCartStore } from './cart-store'

// Ignore this flag after first bootstrap
// (to avoid multiple re-fetches in dev mode with React StrictMode)
let didBootstrap = false

// Helper function to clear cart store during logout
const clearCartOnLogout = () => {
  try {
    // Clear the cart store state
    const cartStore = useCartStore.getState()
    cartStore.items = []
    cartStore.summary = {
      totalPublishedCourses: 0,
      totalPriceCents: 0,
      currency: 'USD'
    }
    // Also clear from localStorage
    localStorage.removeItem('engpro-cart-storage')
  } catch (error) {
    console.error('Failed to clear cart on logout:', error)
  }
}

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      // persisted
      user: null,
      isLoggedIn: false,

      // runtime-only
      hasHydrated: false,
      isFetchingUser: false,

      // setters
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setIsLoggedIn: (v) => set({ isLoggedIn: v }),

      fetchUser: async (force = false) => {
        const s = get()
        if (!s.isLoggedIn) return
        if (!force && s.isFetchingUser) return

        set({ isFetchingUser: true })
        try {
          const data = await getUser()
          set({ user: data })
        } catch (err) {
          console.error('fetchUser error:', err)
          set({ user: null, isLoggedIn: false })
        } finally {
          set({ isFetchingUser: false })
        }
      },

      updateUser: async ({ fullName, email, avatarFile }) => {
        try {
          const res = await updateUser({ fullName, email, avatarFile });

          if (!res.success) {
            throw new Error(res.error || "Cập nhật người dùng thất bại");
          }

          const updatedData = res.data?.data;
          const currentUser = get().user;
          if (!currentUser) return;

          const newUser = {
            ...currentUser,
            ...updatedData,
          };

          set({ user: newUser });
          return { success: true, data: newUser };
        } catch (error) {
          console.error("Update user error:", error);
          return {
            success: false,
            error: "Cập nhật thất bại",
          };
        }
      },

      loginUser: async (identifier, password) => {
        try {
          const result = await apiLogin(identifier, password)
          if (result?.error) return { error: result.error }

          if (result?.success) {
            set({ isLoggedIn: true })
            await get().fetchUser(true)
            // Fetch cart data after successful login
            try {
              const cartStore = useCartStore.getState()
              await cartStore.fetchCart(true)
            } catch (cartError) {
              console.error('Failed to fetch cart after login:', cartError)
              // Don't fail login if cart fetch fails
            }
            return { success: true }
          }
          return { error: 'Đăng nhập thất bại. Vui lòng thử lại.' }
        } catch (err) {
          console.error('loginUser error:', err)
          return { error: 'Lỗi kết nối server' }
        }
      },

      logoutUser: async () => {
        try {
          const result = await logout()
          set({ user: null, isLoggedIn: false })
          // Clear cart data when user logs out
          clearCartOnLogout()
          return result?.success ? { success: true } : { error: 'Đăng xuất thất bại.' }
        } catch {
          set({ user: null, isLoggedIn: false })
          // Clear cart data even on error
          clearCartOnLogout()
          return { error: 'Đăng xuất thất bại.' }
        }
      },

      logoutAllUser: async () => {
        try {
          const result = await logoutAll()
          set({ user: null, isLoggedIn: false })
          // Clear cart data when user logs out from all devices
          clearCartOnLogout()
          return result?.success ? { success: true } : { error: 'Đăng xuất tất cả thất bại.' }
        } catch {
          set({ user: null, isLoggedIn: false })
          // Clear cart data even on error
          clearCartOnLogout()
          return { error: 'Đăng xuất tất cả thất bại.' }
        }
      },

      oauthLogin: async () => {
        set({ isLoggedIn: true })
        await get().fetchUser(true)
        // Fetch cart data after successful OAuth login
        try {
          const cartStore = useCartStore.getState()
          await cartStore.fetchCart(true)
        } catch (cartError) {
          console.error('Failed to fetch cart after OAuth login:', cartError)
          // Don't fail login if cart fetch fails
        }
      },
    }),
    {
      name: 'engpro-auth-storage',
      storage: createJSONStorage(() => localStorage),

      // Only persist when needed
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),

      // After rehydrate: if logged in, always refetch (to update) user data
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.setHasHydrated(true)

        if (!didBootstrap && state.isLoggedIn) {
          didBootstrap = true
          state.fetchUser(true)
        }
      },
    }
  )
)
