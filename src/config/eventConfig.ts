import { EventType } from "../types/eventTypes";

export const eventConfig: Record<
  EventType,
  {
    type: EventType;
    isHostile: boolean;
  }
> = {
  COMERCIAL: {
    type: "COMERCIAL",
    isHostile: false,
  },
  EXTORTION: {
    type: "EXTORTION",
    isHostile: true,
  },
  INFILTRATION: {
    type: "INFILTRATION",
    isHostile: true,
  },
};
