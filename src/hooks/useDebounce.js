// src/hooks/useDebounce.js
'use client'

import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear the timer if the value changes (user keeps typing)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}