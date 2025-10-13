import { useState, useEffect } from 'react';

/**
 * Hook to detect if device has fine pointer (mouse) or coarse pointer (touch)
 * Returns true for devices with fine pointer (desktop with mouse)
 * Returns false for touch devices (tablets, phones, touch laptops)
 */
export const usePointerType = (): boolean => {
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    // Check if device has fine pointer (mouse) using media query
    const mediaQuery = window.matchMedia('(pointer: fine)');
    
    // Set initial value
    setHasFinePointer(mediaQuery.matches);

    // Listen for changes (e.g., when connecting/disconnecting mouse)
    const handleChange = (e: MediaQueryListEvent) => {
      setHasFinePointer(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return hasFinePointer;
};
