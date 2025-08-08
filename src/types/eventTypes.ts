export type EventType = "build" | "research" | "attack" | "collect" | "move";
export interface Event {
  id: string;
  type: EventType;
  endTime: number;
  parameters: any;
}

export interface EventState {
  events: Event[];
  processEvent: (event: Event) => void;
}
