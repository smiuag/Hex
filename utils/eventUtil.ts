import { resourceEmojis } from "@/src/config/emojisConfig";
import { eventConfig } from "@/src/config/eventConfig";
import {
  DIPLOMACY_CHANGE_LEVEL,
  DIPLOMACY_CHANGE_OPPOSITE,
  DiplomacyChange,
  DiplomacyChangeLevel,
  DiplomaticEvent,
  EventEffect,
  EventOption,
  EventOptionsType,
  EventType,
  NEGATIVE_CHANGE_KEYS,
  NegativeChangeLevel,
  POSITIVE_CHANGE_KEYS,
  PositiveChangeLevel,
  Trade,
} from "@/src/types/eventTypes";
import { ALL_RACES, DiplomacyLevel, raceConfig, RaceType } from "@/src/types/raceType";
import { CombinedResourcesType } from "@/src/types/resourceTypes";
import { Ship, ShipData } from "@/src/types/shipType";
import { formatAmount } from "./generalUtils";
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

export function getOptionDescription(
  tEvent: (key: string, options?: object) => string,
  tShip: (key: string, options?: object) => string,
  optionType: EventOptionsType,
  diplomaticEvent: DiplomaticEvent
): string {
  switch (optionType) {
    case "TRADE":
      if (diplomaticEvent.mainTrade) return ""; //generateTradeDescription(tEvent, tShip, diplomaticEvent.mainTrade);
      return "";
    case "IGNORE":
      const ignoreRandomDescription = Math.ceil(Math.random() * 3);
      const ignoreDescription =
        diplomaticEvent.type == "INFILTRATION"
          ? tEvent(`ignoreInfiltration${ignoreRandomDescription}`)
          : diplomaticEvent.type == "COMERCIAL"
          ? tEvent(`ignoreComercial${ignoreRandomDescription}`)
          : "";
      return ignoreDescription;
    case "RETRIBUTION":
      const randomDescription = Math.ceil(Math.random() * 3);
      const description =
        diplomaticEvent.type == "INFILTRATION" ? tEvent(`retribution${randomDescription}`) : "";
      return description;
    case "FIGHT":
      return "";
    case "DIPLOMACY":
      const diplomaticRandomDescription = Math.ceil(Math.random() * 3);
      const diplomaticDescription =
        diplomaticEvent.type == "INFILTRATION"
          ? tEvent(`infiltrationDiplomatic${diplomaticRandomDescription}`)
          : diplomaticEvent.type == "EXTORTION"
          ? tEvent(`extortionDiplomatic${diplomaticRandomDescription}`)
          : "";
      return diplomaticDescription;
  }
}

export function generateEventTitle(
  tEvent: (key: string, options?: object) => string,
  eventType: EventType,
  race: RaceType
): string {
  const raceName = raceConfig[race].name;
  return tEvent(`${eventType}.singular`, { race: raceName });
}

export function generateDiplomacyChangeDescription(
  tEvent: (key: string, options?: object) => string,
  diplomacyChange: DiplomacyChange
): string {
  const raceName = raceConfig[diplomacyChange.race].name;

  const description =
    tEvent(`diplomacyChange.${diplomacyChange.change}`, { race: raceName }) + "\n";

  return description;
}

export function generateSabotageDescription(
  tEvent: (key: string, options?: object) => string
): string {
  return tEvent(`sabotageEffect`) + "\n";
}

export function getDiplomaticDescription(
  type: EventType,
  tEvent: (key: string, options?: object) => string
): string {
  const randomDescription = Math.ceil(Math.random() * 3);
  const description =
    type == "INFILTRATION"
      ? tEvent(`infiltrationDiplomatic${randomDescription}`)
      : type == "EXTORTION"
      ? tEvent(`extortionDiplomatic${randomDescription}`)
      : "";

  return description;
}

export function generateTradeDescription(
  tEvent: (key: string, options?: object) => string,
  tShip: (key: string, options?: object) => string,
  trade: Trade
): string {
  let description = "";
  let knowledgeOffered = false;

  const offeredResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount > 0)
        .map(
          ([resourceType, amount]) =>
            `${formatAmount(amount)} ${resourceEmojis[resourceType as CombinedResourcesType]}`
        )
    : [];

  const requestedResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount < 0)
        .map(
          ([resourceType, amount]) =>
            `${formatAmount(Math.abs(amount))} ${
              resourceEmojis[resourceType as CombinedResourcesType]
            }`
        )
    : [];

  const offeredShips = trade.shipChange
    ? trade.shipChange
        .filter(({ amount }) => amount > 0)
        .map(({ type, amount }) => `${amount} ${tShip(`shipName.${type}`)}`)
    : [];

  const requestedShips = trade.shipChange
    ? trade.shipChange
        .filter(({ amount }) => amount < 0)
        .map(({ type, amount }) => `${Math.abs(amount)} ${tShip(`shipName.${type}`)}`)
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
  trade: Trade
): string {
  let description = "";
  let extortionText = "";

  const offeredResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount > 0)
        .map(
          ([resourceType, amount]) =>
            `${formatAmount(amount)} ${resourceEmojis[resourceType as CombinedResourcesType]}`
        )
    : [];

  const requestedResources = trade.resourceChange
    ? Object.entries(trade.resourceChange)
        .filter(([_, amount]) => amount < 0)
        .map(
          ([resourceType, amount]) =>
            `${formatAmount(Math.abs(amount))} ${
              resourceEmojis[resourceType as CombinedResourcesType]
            }`
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
    (event) => event != "DEFAULT" && eventConfig[event].isHostile === hostile
  );

  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};

//EFFECTS

const getTradeEfects = (trade: Trade, race: RaceType): EventEffect[] => {
  let effects: EventEffect[] = [];

  const tradeEffect: EventEffect = {
    trade: trade,
    type: "RESOURCE_CHANGE",
    description: "",
    sabotage: false,
  };

  effects.push(tradeEffect);

  const changeType = getRandomPositiveChange();
  const diplomacyEfect = getDiplomacyEfects(race, changeType);
  effects.push(...diplomacyEfect);

  return effects;
};

const getRetributionEfects = (race: RaceType): EventEffect[] => {
  let effects: EventEffect[] = [];

  const effect = getDiplomacyEfects(race, "LARGE_DECREASE");
  effects.push(...effect);

  return effects;
};

const getSabotageEffects = () => {
  let effects: EventEffect[] = [];

  const raceEffect: EventEffect = {
    type: "SABOTAGE",
    description: "",
    sabotage: true,
  };

  effects.push(raceEffect);

  return effects;
};

const getDiplomacyEfects = (race: RaceType, changeType: DiplomacyChangeLevel): EventEffect[] => {
  let effects: EventEffect[] = [];

  const diplomacyChange: DiplomacyChange[] = [];
  const raceChange = { race: race, change: changeType };
  diplomacyChange.push(raceChange);

  const additionalEffect = Math.random() * 100 < DIPLOMACY_CHANGE_LEVEL[changeType];

  if (additionalEffect) {
    const hostileRace = getHostileRace(race);
    if (hostileRace) {
      const hostileChange = {
        race: hostileRace,
        change: DIPLOMACY_CHANGE_OPPOSITE[changeType],
      };
      diplomacyChange.push(hostileChange);
    }
  }

  const raceEffect: EventEffect = {
    type: "DIPLOMACY_CHANGE",
    diplomacy: diplomacyChange,
    description: "",
    sabotage: false,
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

const getRetributionOption = (race: RaceType): EventOption => {
  const effects = getRetributionEfects(race);

  const option: EventOption = {
    type: "RETRIBUTION",
    effects: effects,
    description: "",
  };
  return option;
};

const getDiplomacyOption = (race: RaceType, type: EventType, abuseLevel?: number): EventOption => {
  const effects: EventEffect[] = [];

  if (type == "INFILTRATION") {
    const diplomacyChange = getRandomPositiveChange();
    const effect = getDiplomacyEfects(race, diplomacyChange);
    effects.push(...effect);
  }

  if (type == "EXTORTION" && abuseLevel) {
    const tradeExtortion = createTradeEventEffect(Math.min(abuseLevel / 2, 2));
    const tradeEffect: EventEffect = {
      type: "RESOURCE_CHANGE",
      trade: tradeExtortion,
      description: "",
      sabotage: false,
    };

    const extortionEffect = getDiplomacyEfects(race, "SMALL_DECREASE");
    effects.push(tradeEffect);
    effects.push(...extortionEffect);
  }

  const randomDescription = Math.ceil(Math.random() * 3);
  // const description =
  //   type == "INFILTRATION"
  //     ? tEvent(`infiltrationDiplomatic${randomDescription}`)
  //     : type == "EXTORTION"
  //     ? tEvent(`extortionDiplomatic${randomDescription}`)
  //     : "";

  const option: EventOption = {
    type: "DIPLOMACY",
    effects: effects,
    description: "",
  };
  return option;
};

const getIgnoreOption = (race: RaceType, type: EventType): EventOption => {
  const effects: EventEffect[] = [];

  if (type == "EXTORTION") {
    const diplomacyChange = getRandomNegativeChange();
    const effect = getDiplomacyEfects(race, diplomacyChange);
    effects.push(...effect);
  }

  if (type == "INFILTRATION") {
    const effect = getSabotageEffects();
    effects.push(...effect);
  }

  const option: EventOption = {
    type: "IGNORE",
    effects: effects,
    description: "",
  };
  return option;
};

const getTradeOption = (race: RaceType, trade: Trade): EventOption => {
  const effects = getTradeEfects(trade, race);
  const option: EventOption = {
    type: "TRADE",
    effects: effects,
    description: "",
  };
  return option;
};

const getOptionsByType = (
  type: EventType,
  race: RaceType,
  mainTrade?: Trade,
  abuseLevel?: number
): EventOption[] => {
  let options: EventOption[] = [];

  switch (type) {
    case "COMERCIAL":
      options.push(getTradeOption(race, mainTrade!));
      options.push(getIgnoreOption(race, type));
      break;

    case "EXTORTION":
      options.push(getTradeOption(race, mainTrade!));
      //options.push(getFightOption());
      options.push(getDiplomacyOption(race, type, abuseLevel));
      options.push(getIgnoreOption(race, type));
      break;

    case "INFILTRATION":
      options.push(getRetributionOption(race));
      options.push(getDiplomacyOption(race, type));
      options.push(getIgnoreOption(race, type));
      break;
  }

  return options;
};

//END TIME
const getEndTimeByType = (type: EventType): number => {
  switch (type) {
    case "COMERCIAL":
      return Date.now() + 1000 * 3600 * 48 * Math.min(0.5, Math.random());

    case "EXTORTION":
      return Date.now() + 1000 * 3600 * 24 * Math.min(0.2, Math.random());

    case "INFILTRATION":
      return Date.now() + 1000 * 3600 * 24 * Math.min(0.5, Math.random());

    case "DEFAULT":
      return 0;
  }
};

export const getEventDescription = (
  tEvent: (key: string, options?: object) => string,
  tShip: (key: string, options?: object) => string,
  diplomaticEvent: DiplomaticEvent
): string => {
  switch (diplomaticEvent.type) {
    case "COMERCIAL":
      return generateTradeDescription(tEvent, tShip, diplomaticEvent.mainTrade!);

    case "EXTORTION":
      return generateExtortionDescription(tEvent, diplomaticEvent.mainTrade!);

    case "INFILTRATION":
      return generateInfiltrationText(tEvent);

    case "DEFAULT":
      return "";
  }
};

export function getRandomEvent(playerDiplomacy: DiplomacyLevel[]): DiplomaticEvent {
  const race = getRandomRace() as RaceType;
  const isHostile = playerDiplomacy.some((pd) => pd.race === race && pd.diplomacyLevel < 500);
  const type = getRandomEventByHostility(isHostile);

  const abuseLevel = 1 + Math.random() * 9;
  const mainTrade =
    type == "COMERCIAL"
      ? createTradeEventEffect(0.5 + Math.random() / 2)
      : type == "EXTORTION"
      ? createTradeEventEffect(abuseLevel)
      : undefined;

  //const title = generateEventTitle(tEvent, type, race);
  const options = getOptionsByType(type, race, mainTrade, abuseLevel);
  const endTime = getEndTimeByType(type);
  //const description = getDescriptionByType(tEvent, type);

  const event: DiplomaticEvent = {
    type: type,
    completed: false,
    hostile: isHostile,
    races: race,
    title: "",
    description: "",
    options: options,
    endTime: endTime,
    mainTrade: mainTrade,
  };

  return event;
}
