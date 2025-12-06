import { create } from "zustand"

export const useUIStore = create((set) => ({
  openWidget: null, // "chat" | "dict" | null
  setOpenWidget: (widget) => set({ openWidget: widget }),
}))
