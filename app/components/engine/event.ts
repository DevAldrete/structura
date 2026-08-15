export type ArrayEvent =
  | { action: 'compare'; ids: [number, number] }
  | { action: 'swap'; ids: [number, number] }
  | { action: 'write'; index: number; value: number };

export type StEvent = ArrayEvent;
