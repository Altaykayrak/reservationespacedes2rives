
/// <reference types="vite/client" />

// Define the Screen Orientation API for global usage
interface ScreenOrientationAPI {
  lock(orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'): Promise<void>;
  unlock(): void;
  type: string;
  angle: number;
}

// Extend the Screen interface for TypeScript
interface Screen {
  orientation?: ScreenOrientationAPI;
}
