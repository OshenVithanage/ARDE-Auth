'use client'

import { useState, useEffect } from 'react';

export function useSidebar() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // Default to collapsed

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-expanded');
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
    // If no saved state exists, it will remain collapsed (false)
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  return {
    isExpanded,
    toggleSidebar
  };
}
