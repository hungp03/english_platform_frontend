"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"
import { useUIStore } from "@/store/ui"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { usePathname } from "next/navigation"

export default function LabanDictFrame() {
  const pathname = usePathname()
  const { openWidget, setOpenWidget } = useUIStore()
  const isOpen = openWidget === "dict"
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Paths where the dictionary widget should not be visible
  const hiddenPaths = [
    '/account/*',
    '/login',
    '/register',
    '/forgot-password',
    '/cart',
    '/payment/*',
    'become-instructor'
  ]

  // Check if current path should hide the widget
  const shouldHide = hiddenPaths.some(path => {
    if (path.endsWith('/*')) {
      return pathname.startsWith(path.slice(0, -2))
    }
    return pathname === path || pathname.startsWith(path + '/')
  })

  useEffect(() => {
    if (!isOpen || !isMounted) return

    // Block request laban.vn/stats
    const originalOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function (method, url, async, username, password) {
      const urlStr = typeof url === "string" ? url : url.toString()
      if (urlStr.includes("laban.vn/stats/dictplg")) {
        return
      }
      return originalOpen.call(this, method, url, async === undefined ? true : async, username, password)
    }

    // Plugin config
    const config = {
      s: "https://dict.laban.vn",
      w: 330,
      h: 370,
      hl: 2,
      th: 3,
    }

    // Load plugin script
    const script = document.createElement("script")
    script.src = "https://stc-laban.zdn.vn/dictionary/js/plugin/lbdictplugin.frame.min.js"
    script.async = true
    script.onload = () => {
      if (window.lbDictPluginFrame) {
        window.lbDictPluginFrame.init(config)
      } else {
        console.warn("lbDictPluginFrame not found.")
      }
    }

    document.body.appendChild(script)

    return () => {
      XMLHttpRequest.prototype.open = originalOpen
      document.body.removeChild(script)
    }
  }, [isOpen, isMounted])

  if (shouldHide) return null

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setOpenWidget(isOpen ? null : "dict")}
            className="fixed bottom-24 right-6 bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-[10] hover:bg-blue-700 transition"
          >
            <BookOpen className="w-6 h-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white px-2 py-1 text-xs rounded">
          {isOpen ? "Đóng" : "Từ điển"}
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <div className="fixed bottom-40 right-6 w-[350px] h-[420px] bg-white border rounded-lg shadow-xl p-2 z-[10]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Dictionary
            </h2>
            <button
              onClick={() => setOpenWidget(null)}
              className="text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </div>
          <div id="lbdict_plugin_frame" />
        </div>
      )}
    </>
  )
}
