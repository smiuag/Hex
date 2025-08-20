import { buildingConfig } from "@/src/config/buildingConfig";
import { researchConfig } from "@/src/config/researchConfig";
import { FleetData } from "@/src/types/fleetType";
import { Hex } from "@/src/types/hexTypes";
import { Process, ProcessType } from "@/src/types/processTypes";
import { Research } from "@/src/types/researchTypes";
import { Ship, ShipSpecsCtx, ShipType } from "@/src/types/shipType";
import { getBuildTime } from "../utils/buildingUtils";
import { getResearchTime } from "../utils/researchUtils";
import { getSpecByType, isCustomType } from "./shipUtils";

export const getBuildingProcesses = (
  hexes: Hex[],
  tBuilding: (key: string) => string
): Process[] => {
  const processes: Process[] = [];

  hexes.forEach((hex) => {
    if (hex.construction) {
      const targetLevel = hex.construction.targetLevel ?? 1;
      const duration = getBuildTime(hex.construction.building, targetLevel);
      const name = tBuilding(`buildingName.${hex.construction.building}`);
      const startedAt = hex.construction.startedAt ?? 0;

      const proc: Process = {
        name:
          "Construcción: " +
          (hex.construction.targetLevel == 1 ? `${name}` : `${name} (Lvl: ${targetLevel})`),
        type: "BUILDING",
        id: "BUILDING-" + `${hex.q}-${hex.r}`,
        startedAt,
        duration,
        image: buildingConfig[hex.construction.building].imageBackground,
        q: hex.q,
        r: hex.r,
      };

      processes.push(proc);
    }
  });

  return processes;
};

export const getResearchProcesses = (
  research: Research[],
  tResearch: (key: string) => string
): Process[] => {
  const processes: Process[] = [];

  research.forEach((r) => {
    if (r.progress) {
      const targetLevel = r.progress.targetLevel ?? 1;
      const duration = getResearchTime(r.data.type, r.progress.targetLevel);
      const config = researchConfig[r.data.type];
      const startedAt = r.progress.startedAt ?? 0;

      const proc: Process = {
        name:
          "Investigación: " + (tResearch("researchName." + r.data.type) + " Nv: " + targetLevel),
        type: "RESEARCH",
        id: "RESEARCH-" + r.data.type,
        researchType: r.data.type,
        startedAt,
        duration,
        image: config.image,
      };

      processes.push(proc);
    }
  });

  return processes;
};

export const getShipProcesses = (
  tShip: (key: string) => string,
  shipBuildQueue: Ship[],
  specs: ShipSpecsCtx
): Process[] => {
  const processes: Process[] = [];

  for (const r of shipBuildQueue) {
    const p = r.progress;
    if (!p || (p.targetAmount ?? 0) <= 0) continue;

    const spec = getSpecByType(r.type, specs); // ✅ builtin o custom
    const targetAmount = p.targetAmount!;
    const totalTime = spec.baseBuildTime * targetAmount;
    const startedAt = p.startedAt ?? 0;

    // Nombre: usa i18n para builtin y spec.name para custom
    const displayName = isCustomType(r.type) ? spec.name : tShip(`shipName.${r.type as ShipType}`);

    const proc: Process = {
      name:
        "Flota: " + `${displayName} ${targetAmount} ${targetAmount === 1 ? "unidad" : "unidades"}`,
      type: "SHIP",
      shipType: r.type, // ✅ ahora puede ser builtin o custom
      id: `SHIP-${r.type}`,
      duration: totalTime,
      startedAt,
      image: spec.imageBackground, // ✅ viene de spec
    };

    processes.push(proc);
  }

  return processes;
};

export const getFleetProcesses = (fleetData: FleetData[], specs: ShipSpecsCtx): Process[] => {
  const processes: Process[] = [];

  fleetData.forEach((fleet) => {
    const fleetShips = fleet.ships.reduce((total, fl) => total + fl.amount, 0);

    const spec = getSpecByType(fleet.ships[0].type, specs); // ✅ builtin o custom
    const totalTime = fleet.endTime - fleet.startTime;

    let type: ProcessType;
    let name: string;

    switch (fleet.movementType) {
      case "EXPLORE SYSTEM":
        type = "EXPLORATION SYSTEM FLEET";
        name =
          fleetShips +
          " nave" +
          (fleetShips > 1 ? "s" : "") +
          " rumbo a explorar un nuevo sistema ";
        break;
      case "RETURN":
        type = "RETURN FLEET";
        name =
          fleetShips + " nave" + (fleetShips > 1 ? "s" : "") + " volviendo a su sistema de origen";
        break;
      case "ATTACK":
        type = "ATTACK FLEET";
        name = fleetShips + " nave" + (fleetShips > 1 ? "s" : "") + " rumbo a atacar un systema ";
        break;
      case "EXPLORE CELESTIALBODY":
        type = "EXPLORATION PLANET FLEET";
        name =
          fleetShips +
          " nave" +
          (fleetShips > 1 ? "s" : "") +
          " rumbo a explorar un nuevo planeta ";
        break;
      case "MOVEMENT":
        type = "MOVEMENT FLEET";
        name = fleetShips + " nave" + (fleetShips > 1 ? "s" : "") + " viajando a otro sistema ";
        break;
      case "COLLECT":
        type = "COLLECT";
        name = "Carguero rumbo a una colonia a por recursos.";
        break;
    }

    const proc: Process = {
      name,
      type,
      id: "FLEET-" + fleet.id,
      resources: fleet.resources,
      duration: totalTime,
      startedAt: fleet.startTime,
      collectSystemId: fleet.movementType == "COLLECT" ? fleet.destinationSystemId : undefined,
      explorationSystemId:
        fleet.movementType == "EXPLORE SYSTEM" || fleet.movementType == "EXPLORE CELESTIALBODY"
          ? fleet.destinationSystemId
          : undefined,
      explorationPlanetId:
        fleet.movementType == "EXPLORE CELESTIALBODY" ? fleet.destinationPlanetId : undefined,
      attackSystemId: fleet.movementType == "ATTACK" ? fleet.destinationSystemId : undefined,
      fleetId: fleet.movementType == "MOVEMENT" ? fleet.id : undefined,

      image: spec.imageBackground,
    };

    processes.push(proc);
  });

  return processes;
};
