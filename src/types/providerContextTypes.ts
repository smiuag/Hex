import { CombinedResources } from "./resourceTypes";
import { Draft, ShipDesignAttempt } from "./shipType";

type StartConflictReason = "different_draft_in_progress" | "same_draft_already_running";

type CanStartOk = { ok: true };
type CanStartKo = { ok: false; reason: StartConflictReason; active: ShipDesignAttempt };
export type CanStartResult = CanStartOk | CanStartKo;

export type StartAttemptParams = {
  draft: Draft;
  baseSuccessChance: number;
  attemptCost: Partial<CombinedResources>;
  fixedDurationMs?: number;
};

type StartAttemptOk = { ok: true; attempt: ShipDesignAttempt };
export type StartAttemptResult = StartAttemptOk | CanStartKo;
