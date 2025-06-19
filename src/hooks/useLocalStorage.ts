'use client';

import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Convert date strings back to Date objects
        const convertDates = (obj: unknown): unknown => {
          if (obj && typeof obj === 'object' && obj !== null) {
            const objRecord = obj as Record<string, unknown>;
            if (objRecord.createdAt && typeof objRecord.createdAt === 'string') {
              objRecord.createdAt = new Date(objRecord.createdAt);
            }
            if (objRecord.updatedAt && typeof objRecord.updatedAt === 'string') {
              objRecord.updatedAt = new Date(objRecord.updatedAt);
            }
            if (Array.isArray(obj)) {
              return obj.map(convertDates);
            }
            Object.keys(objRecord).forEach(k => {
              if (objRecord[k] && typeof objRecord[k] === 'object') {
                objRecord[k] = convertDates(objRecord[k]);
              }
            });
          }
          return obj;
        };
        return convertDates(parsed) as T;
      }
      return initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
} 