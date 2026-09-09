// src/app/blogs/SearchInput.jsx
'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchInput({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500) // Wait 500ms after last keystroke

  useEffect(() => {
    // Only fire the search request when the debounced value updates
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search blogs dynamically..."
      className="w-full border border-gray-300 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}