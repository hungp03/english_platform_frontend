"use client";
import { useEffect, useState } from "react";

export default function useDebouncedValue(value, delay = 1500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
