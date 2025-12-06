"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const SearchComponent = ({
  searchTerm,
  handleSearchChange,
  handleSearchSubmit,
  searchRef,
  inputRef,
  isMobile = false,
}) => (
  <div className={`relative ${isMobile ? "w-full" : "w-96"}`} ref={searchRef}>
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
    <Input
      key="search-input"
      ref={inputRef}
      type="text"
      placeholder="Tìm bài luyện tập..."
      value={searchTerm}
      onChange={(e) => handleSearchChange(e.target.value)}
      onKeyDown={handleSearchSubmit}
      className={`pl-10 pr-10 ${isMobile ? "w-full" : ""}`}
      autoComplete="off"
    />
  </div>
)

export default SearchComponent
