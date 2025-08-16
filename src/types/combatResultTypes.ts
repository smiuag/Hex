import { ShipData } from "./shipType";

/* -------------------------------------------------------------------------- */
/*                              Tipos del combate                              */
/* -------------------------------------------------------------------------- */

export type Turn = {
  turn: number;
  attackerRemaining: ShipData[];
  defenderRemaining: ShipData[];
  attackerLost: ShipData[];
  defenderLost: ShipData[];
};

export type CombatResult = {
  id: string;
  date: number;
  sistem: string;
  attackers: ShipData[];
  defenders: ShipData[];
  turns: Turn[];
  playerIsAttacker: boolean;
  totalTurns: number;
  playerWins: boolean;
};

export type CombatResultsPage = {
  items: CombatResult[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextPage: number | null;
};
