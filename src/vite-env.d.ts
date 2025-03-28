
/// <reference types="vite/client" />

// Define the Screen Orientation API for global usage
interface ScreenOrientationAPI {
  lock(orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'): Promise<void>;
  unlock(): void;
  type: string;
  angle: number;
  onchange: ((this: ScreenOrientation, ev: Event) => any) | null;
  addEventListener<K extends keyof ScreenOrientationEventMap>(type: K, listener: (this: ScreenOrientation, ev: ScreenOrientationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof ScreenOrientationEventMap>(type: K, listener: (this: ScreenOrientation, ev: ScreenOrientationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  dispatchEvent(event: Event): boolean;
}

// Extend the Screen interface for TypeScript
interface Screen {
  orientation?: ScreenOrientationAPI;
}
