"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import _ from "lodash"
import { toast } from "sonner"
import SearchComponent from "."

export default function SearchContainer({ isMobile = false }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  const debouncedSearch = useMemo(
    () => _.debounce(async (keyword) => {
      if (!keyword.trim()) return
      try {
        setIsSearching(true)
        // TODO: gọi API search
      } catch (err) {
        toast.error("Lỗi khi tìm kiếm")
      } finally {
        setIsSearching(false)
      }
    }, 500),
    []
  )

  const handleSearchChange = (val) => {
    setSearchTerm(val)
    debouncedSearch(val)
  }

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      // TODO: handle enter
    }
  }

  return (
    <SearchComponent
      searchTerm={searchTerm}
      handleSearchChange={handleSearchChange}
      handleSearchSubmit={handleSearchSubmit}
      searchRef={searchRef}
      inputRef={inputRef}
      isMobile={isMobile}
    />
  )
}
