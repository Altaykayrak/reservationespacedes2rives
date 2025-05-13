
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a global event bus for reservation updates
export const createEventBus = () => {
  const listeners: Record<string, Function[]> = {};
  
  return {
    subscribe: (event: string, callback: Function) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
      
      // Return unsubscribe function
      return () => {
        listeners[event] = listeners[event].filter(listener => listener !== callback);
      };
    },
    
    publish: (event: string, data?: any) => {
      if (!listeners[event]) return;
      listeners[event].forEach(callback => callback(data));
    }
  };
};

export const eventBus = createEventBus();
