export type Action = 'swap' | 'compare';

export interface StEvent {
  action: Action;
  ids: [number, number];
}
