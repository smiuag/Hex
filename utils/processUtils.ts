import { FleetData } from "@/src/types/fleetType";
import { buildingConfig } from "../src/config/buildingConfig";
import { researchConfig } from "../src/config/researchConfig";
import { shipConfig } from "../src/config/shipConfig";
import { Hex } from "../src/types/hexTypes";
import { Process, ProcessType } from "../src/types/processTypes";
import { Research } from "../src/types/researchTypes";
import { Ship } from "../src/types/shipType";
import { getBuildTime } from "../utils/buildingUtils";
import { getResearchTime } from "../utils/researchUtils";

export const getBuildingProcesses = (hexes: Hex[]): Process[] => {
  const processes: Process[] = [];

  hexes.forEach((hex) => {
    if (hex.construction) {
      const targetLevel = hex.construction.targetLevel ?? 1;
      const duration = getBuildTime(hex.construction.building, targetLevel);
      const name = buildingConfig[hex.construction.building].name;
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
  shipBuildQueue: Ship[]
): Process[] => {
  const processes: Process[] = [];

  shipBuildQueue.forEach((r) => {
    if (r.progress) {
      const targetAmount = r.progress.targetAmount ?? 0;
      const config = shipConfig[r.type];
      const totalTime = config.baseBuildTime * targetAmount;
      const startedAt = r.progress.startedAt ?? 0;
      const proc: Process = {
        name:
          "Flota: " +
          (tShip("shipName." + r.type) +
            " " +
            targetAmount +
            (targetAmount == 1 ? " unidad" : " unidades")),
        type: "SHIP",
        shipType: r.type,
        id: "SHIP-" + r.type,
        duration: totalTime,
        startedAt,

        image: config.imageBackground,
      };

      processes.push(proc);
    }
  });

  return processes;
};

export const getFleetProcesses = (fleetData: FleetData[]): Process[] => {
  const processes: Process[] = [];

  fleetData.forEach((fleet) => {
    const fleetShips = fleet.ships.reduce((total, fl) => total + fl.amount, 0);
    const config = shipConfig[fleet.ships[0].type];
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
        name = fleetShips + " nave" + (fleetShips > 1 ? "s" : "") + " volviendo a casa";
        break;
      case "ATTACK":
        type = "ATTACK FLEET";
        name = fleetShips + " nave" + (fleetShips > 1 ? "s" : "") + " rumbo a atacar un systema ";
        break;
      case "EXPLORE PLANET":
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
    }

    const proc: Process = {
      name,
      type,
      id: "FLEET-" + fleet.id,
      duration: totalTime,
      startedAt: fleet.startTime,
      explorationSystemId:
        fleet.movementType == "EXPLORE SYSTEM" || fleet.movementType == "EXPLORE PLANET"
          ? fleet.destinationSystemId
          : undefined,
      explorationPlanetId:
        fleet.movementType == "EXPLORE PLANET" ? fleet.destinationPlanetId : undefined,
      attackSystemId: fleet.movementType == "ATTACK" ? fleet.destinationSystemId : undefined,
      image: config.imageBackground,
    };

    processes.push(proc);
  });

  return processes;
};
