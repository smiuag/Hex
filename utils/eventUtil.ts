import { resourceEmojis } from "@/src/config/emojisConfig";
import { eventConfig } from "@/src/config/eventConfig";
import {
  DIPLOMACY_CHANGE_LEVEL,
  DIPLOMACY_CHANGE_OPPOSITE,
  DiplomacyChange,
  DiplomacyChangeLevel,
  Event,
  EventEffect,
  EventOption,
  EventType,
  NEGATIVE_CHANGE_KEYS,
  NegativeChangeLevel,
  POSITIVE_CHANGE_KEYS,
  PositiveChangeLevel,
  Trade,
} from "@/src/types/eventTypes";
import { ALL_RACES, DiplomacyLevel, raceConfig, RaceType } from "@/src/types/raceType";
import { CombinedResources, CombinedResourcesType } from "@/src/types/resourceTypes";
import { Ship, ShipData } from "@/src/types/shipType";
import { createTradeEventEffect } from "./tradeUtils";

function getHostileRace(race: RaceType): RaceType {
  return raceConfig[race].hostiles[Math.floor(Math.random() * raceConfig[race].hostiles.length)];
}

export const getRandomPositiveChange = (): PositiveChangeLevel => {
  const i = Math.floor(Math.random() * POSITIVE_CHANGE_KEYS.length);
  return POSITIVE_CHANGE_KEYS[i];
};

export const getRandomNegativeChange = (): NegativeChangeLevel => {
  const i = Math.floor(Math.random() * NEGATIVE_CHANGE_KEYS.length);
  return NEGATIVE_CHANGE_KEYS[i];
};
//TEXTS

function generateEventTitle(
  tEvent: (key: string, options?: object) => string,
  eventType: EventType,
  race: RaceType
): string {
  return tEvent(`${eventType}.singular`, { race: race });
}

function generateDiplomacyChangeDescription(
  tEvent: (key: string, options?: object) => string,
  diplomacyChange: DiplomacyChange
): string {
  const raceName = raceConfig[diplomacyChange.race].name;

  return tEvent(`diplomacyChange.${diplomacyChange.change}`, { race: raceName });
}

function generateTradeDescription(
  tEvent: (key: string, options?: object) => string,
  trade: Trade
): string {
  let description = "";
  let knowledgeOffered = false;

  const offeredResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount > 0)
        .map(
          ([resourceType, amount]) =>
            `${amount} ${resourceEmojis[resourceType as CombinedResourcesType]}`
        )
    : [];

  const requestedResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount < 0)
        .map(
          ([resourceType, amount]) =>
            `${Math.abs(amount)} ${resourceEmojis[resourceType as CombinedResourcesType]}`
        )
    : [];

  const offeredShips = trade.shipChange
    ? trade.shipChange
        .filter(({ amount }) => amount > 0)
        .map(({ type, amount }) => `${amount} ${tEvent(`shipType.${type}`)}`)
    : [];

  const requestedShips = trade.shipChange
    ? trade.shipChange
        .filter(({ amount }) => amount < 0)
        .map(({ type, amount }) => `${Math.abs(amount)} ${tEvent(`shipType.${type}`)}`)
    : [];

  if (offeredResources.length > 0 && requestedResources.length > 0) {
    description = `${tEvent("trade.OFFER")} ${offeredResources.join(", ")} ${tEvent(
      "trade.EXCHANGE"
    )} ${requestedResources.join(", ")}.`;
    knowledgeOffered = true;
  } else if (offeredResources.length > 0) {
    description = `${tEvent("trade.OFFER")} ${offeredResources.join(", ")}.`;
    knowledgeOffered = true;
  } else if (requestedResources.length > 0) {
    description = `${tEvent("trade.ASK")} ${requestedResources.join(", ")}.`;
  }

  if (offeredShips.length > 0 && requestedShips.length > 0) {
    description += ` ${tEvent("trade.OFFER")} ${offeredShips.join(", ")} ${tEvent(
      "trade.EXCHANGE"
    )} ${requestedShips.join(", ")}.`;
  } else if (offeredShips.length > 0) {
    description += ` ${tEvent("trade.OFFER")} ${offeredShips.join(", ")}.`;
  } else if (requestedShips.length > 0) {
    description += ` ${tEvent("trade.ASK")} ${requestedShips.join(", ")}.`;
  }

  if (trade.specialReward) {
    description += ` ${
      knowledgeOffered ? tEvent("trade.TECH_SHARE") : tEvent("trade.SE_OFFRE_TECH")
    }`;
  }

  return description;
}

function generateExtortionDescription(
  tEvent: (key: string, options?: object) => string,
  resourceEmojis: Record<CombinedResourcesType, string>,
  resourceChange: CombinedResources,
  shipChange: ShipData[] = []
): string {
  let description = "";
  let extortionText = "";

  const offeredResources = Object.entries(resourceChange)
    .filter(([_, amount]) => amount > 0)
    .map(
      ([resourceType, amount]) =>
        `${amount} ${resourceEmojis[resourceType as CombinedResourcesType]}`
    );

  const requestedResources = Object.entries(resourceChange)
    .filter(([_, amount]) => amount < 0)
    .map(
      ([resourceType, amount]) =>
        `${Math.abs(amount)} ${resourceEmojis[resourceType as CombinedResourcesType]}`
    );

  const offeredShips = shipChange
    .filter(({ amount }) => amount > 0)
    .map(({ type, amount }) => `${amount} ${tEvent(`shipType.${type}`)}`);

  const requestedShips = shipChange
    .filter(({ amount }) => amount < 0)
    .map(({ type, amount }) => `${Math.abs(amount)} ${tEvent(`shipType.${type}`)}`);

  if (requestedResources.length > 0 && offeredResources.length === 0) {
    extortionText = `${tEvent("extortion.ASK")} ${requestedResources.join(", ")}.`;
  } else if (requestedResources.length > 0 && offeredResources.length > 0) {
    extortionText = `${tEvent("extortion.ASK")} ${requestedResources.join(", ")} ${tEvent(
      "extortion.EXCHANGE"
    )} ${offeredResources.join(", ")}.`;
  }

  if (offeredShips.length > 0 && requestedShips.length === 0) {
    extortionText = `${tEvent("extortion.ASK")} ${offeredShips.join(", ")}.`;
  } else if (offeredShips.length > 0 && requestedShips.length > 0) {
    extortionText = `${tEvent("extortion.ASK")} ${requestedShips.join(", ")} ${tEvent(
      "extortion.EXCHANGE"
    )} ${offeredShips.join(", ")}.`;
  }

  description = extortionText;

  return description;
}

function generateInfiltrationText(tEvent: (key: string, options?: object) => string): string {
  const infiltrators = [
    tEvent("infiltration.INFILTRATOR"),
    tEvent("infiltration.INFILTRATED_GROUP"),
    tEvent("infiltration.ENEMY_AGENTS"),
  ];

  const actions = [
    tEvent("infiltration.DETECTED"),
    tEvent("infiltration.ATTEMPTING"),
    tEvent("infiltration.WITH_INTENT"),
  ];

  const objectives = [
    tEvent("infiltration.STEAL_RESOURCES"),
    tEvent("infiltration.STEAL_TECHNOLOGY"),
    tEvent("infiltration.SABOTAGE"),
    tEvent("infiltration.REBELION"),
  ];

  const randomInfiltrator = infiltrators[Math.floor(Math.random() * infiltrators.length)];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomObjective = objectives[Math.floor(Math.random() * objectives.length)];

  return `${randomInfiltrator} ${randomAction} ${randomObjective}.`;
}

function generateInstantAttackText(
  attackingShips: ShipData[],
  tEvent: (key: string, options?: object) => string
): string {
  if (attackingShips.length === 0) {
    return tEvent("event.noAttack");
  }

  const attackingShipDescriptions = attackingShips.map(
    (ship) => `${ship.amount} ${tEvent(`shipType.${ship.type}`)}`
  );

  return `${tEvent("event.attackWarning")} ${attackingShipDescriptions.join(", ")}.`;
}

const getRandomRace = (): RaceType => {
  const index = Math.floor(Math.random() * ALL_RACES.length);
  return ALL_RACES[index];
};

const getRandomEventByHostility = (hostile: boolean): EventType => {
  const filtered = (Object.keys(eventConfig) as EventType[]).filter(
    (event) => eventConfig[event].isHostile === hostile
  );

  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};

//"TRADE" | "FIGHT" | "DIPLOMACY" | "RETRIBUTION"

//EFFECTS

const getTradeEfects = (
  tEvent: (key: string, options?: object) => string,
  trade: Trade,
  race: RaceType
): EventEffect[] => {
  let effects: EventEffect[] = [];

  const tradeEffect: EventEffect = {
    trade: trade,
    type: "RESOURCE_CHANGE",
    description: generateTradeDescription(tEvent, trade),
  };
  effects.push(tradeEffect);

  const changeType = getRandomPositiveChange();
  const diplomacyEfect = getDiplomacyEfects(tEvent, race, changeType);
  effects.push(...diplomacyEfect);

  return effects;
};

const getRetributionEfects = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType
): EventEffect[] => {
  let effects: EventEffect[] = [];

  const effect = getDiplomacyEfects(tEvent, race, "LARGE_DECREASE");
  effects.push(...effect);

  return effects;
};

const getDiplomacyEfects = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType,
  changeType: DiplomacyChangeLevel
): EventEffect[] => {
  let effects: EventEffect[] = [];

  const diplomacyChange: DiplomacyChange[] = [];
  const raceChange = { race: race, change: changeType };
  diplomacyChange.push(raceChange);

  const additionalEffect = Math.random() * 10 < DIPLOMACY_CHANGE_LEVEL[changeType];
  let description = generateDiplomacyChangeDescription(tEvent, raceChange);

  if (additionalEffect) {
    const hostileRace = getHostileRace(race);
    const hostileChange = {
      race: hostileRace,
      change: DIPLOMACY_CHANGE_OPPOSITE[changeType],
    };
    diplomacyChange.push(hostileChange);
    description += "\n" + generateDiplomacyChangeDescription(tEvent, hostileChange);
  }

  const raceEffect: EventEffect = {
    type: "DIPLOMACY_CHANGE",
    diplomacy: diplomacyChange,
    description: description,
  };

  effects.push(raceEffect);

  return effects;
};

const getFightEfects = (): EventEffect[] => {
  let effects: EventEffect[] = [];

  return effects;
};

//OPTIONS

const getFightOption = (
  tEvent: (key: string, options?: object) => string,
  ships: Ship[]
): EventOption => {
  const effects = getFightEfects();
  const option: EventOption = {
    type: "FIGHT",
    effects: effects,
    description: generateInstantAttackText(ships, tEvent),
  };
  return option;
};

const getRetributionOption = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType
): EventOption => {
  const effects = getRetributionEfects(tEvent, race);

  const randomDescription = Math.ceil(Math.random() * 3);
  const description = tEvent(`retributionDiplomatic${randomDescription}`);

  const option: EventOption = {
    type: "RETRIBUTION",
    effects: effects,
    description: description,
  };
  return option;
};

const getDiplomacyOption = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType,
  type: EventType,
  abuseLevel?: number
): EventOption => {
  const effects: EventEffect[] = [];

  if (type == "INFILTRATION") {
    const diplomacyChange = getRandomPositiveChange();
    const effect = getDiplomacyEfects(tEvent, race, diplomacyChange);
    effects.push(...effect);
  }

  if (type == "EXTORTION" && abuseLevel) {
    const tradeExtortion = createTradeEventEffect(Math.min(abuseLevel / 2, 2));
    const tradeEffect: EventEffect = {
      type: "RESOURCE_CHANGE",
      trade: tradeExtortion,
      description: generateTradeDescription(tEvent, tradeExtortion),
    };

    const extortionEffect = getDiplomacyEfects(tEvent, race, "SMALL_DECREASE");
    effects.push(tradeEffect);
    effects.push(...extortionEffect);
  }

  const randomDescription = Math.ceil(Math.random() * 3);
  const description =
    type == "INFILTRATION"
      ? tEvent(`infiltrationDiplomatic${randomDescription}`)
      : type == "EXTORTION"
      ? tEvent(`extortionDiplomatic${randomDescription}`)
      : "";

  const option: EventOption = {
    type: "DIPLOMACY",
    effects: effects,
    description: description,
  };
  return option;
};

const getIgnoreOption = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType,
  type: EventType
): EventOption => {
  const effects: EventEffect[] = [];

  if (type == "EXTORTION") {
    const diplomacyChange = getRandomNegativeChange();
    const effect = getDiplomacyEfects(tEvent, race, diplomacyChange);
    effects.push(...effect);
  }

  if (type == "INFILTRATION") {
    const diplomacyChange = getRandomPositiveChange();
    const effect = getDiplomacyEfects(tEvent, race, diplomacyChange);
    effects.push(...effect);
  }

  const option: EventOption = {
    type: "IGNORE",
    effects: effects,
    description: "",
  };
  return option;
};

const getTradeOption = (
  tEvent: (key: string, options?: object) => string,
  race: RaceType,
  trade: Trade
): EventOption => {
  const effects = getTradeEfects(tEvent, trade, race);
  const option: EventOption = {
    type: "TRADE",
    effects: effects,
    description: generateTradeDescription(tEvent, trade),
  };
  return option;
};

const getOptionsByType = (
  tEvent: (key: string, options?: object) => string,
  type: EventType,
  race: RaceType
): EventOption[] => {
  let options: EventOption[] = [];

  switch (type) {
    case "COMERCIAL":
      const tradeComercial = createTradeEventEffect(0.5 + Math.random() / 2);
      options.push(getTradeOption(tEvent, race, tradeComercial));
      options.push(getIgnoreOption(tEvent, race, type));
      break;

    case "EXTORTION":
      const abuseLevel = 1 + Math.random() * 9;
      const tradeExtortion = createTradeEventEffect(abuseLevel);
      options.push(getTradeOption(tEvent, race, tradeExtortion));
      //options.push(getFightOption());
      options.push(getDiplomacyOption(tEvent, race, type, abuseLevel));
      options.push(getIgnoreOption(tEvent, race, type));
      break;

    case "INFILTRATION":
      options.push(getRetributionOption(tEvent, race));
      options.push(getDiplomacyOption(tEvent, race, type));
      options.push(getIgnoreOption(tEvent, race, type));
      break;
  }

  return options;
};

//END TIME
const getEndTimeByType = (type: EventType): number => {
  switch (type) {
    case "COMERCIAL":
      return Date.now() + 3600 * 48 * Math.min(0.5, Math.random());

    case "EXTORTION":
      return Date.now() + 3600 * 24 * Math.min(0.2, Math.random());

    case "INFILTRATION":
      return Date.now() + 3600 * 24 * Math.min(0.5, Math.random());
  }
};

const getDescriptionByType = (
  tEvent: (key: string, options?: object) => string,
  type: EventType
): string => {
  switch (type) {
    case "COMERCIAL":
      return "";

    case "EXTORTION":
      return generateInfiltrationText(tEvent);

    case "INFILTRATION":
      return "";
  }
};

export function getRandomEvent(
  tEvent: (key: string, options?: object) => string,
  playerDiplomacy: DiplomacyLevel[]
): Event {
  const race = getRandomRace() as RaceType;
  const isHostile = playerDiplomacy.some((pd) => pd.race === race && pd.diplomacyLevel < 500);
  const type = getRandomEventByHostility(isHostile);

  const title = generateEventTitle(tEvent, type, race);
  const options = getOptionsByType(tEvent, type, race);
  const endTime = getEndTimeByType(type);
  const description = getDescriptionByType(tEvent, type);

  const event: Event = {
    type: type,
    completed: false,
    hostile: isHostile,
    races: race,
    title: title,
    description: description,
    options: options,
    endTime: endTime,
  };

  return event;
}
