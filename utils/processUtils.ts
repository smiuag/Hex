import { FleetData } from "@/src/types/fleetType";
import { buildingConfig } from "../src/config/buildingConfig";
import { researchTechnologies } from "../src/config/researchConfig";
import { shipConfig } from "../src/config/shipConfig";
import { Hex } from "../src/types/hexTypes";
import { Process } from "../src/types/processTypes";
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

export const getResearchProcesses = (research: Research[]): Process[] => {
  const processes: Process[] = [];

  research.forEach((r) => {
    if (r.progress) {
      const targetLevel = r.progress.targetLevel ?? 1;
      const duration = getResearchTime(r.data.type, r.progress.targetLevel);
      const config = researchTechnologies[r.data.type];
      const startedAt = r.progress.startedAt ?? 0;

      const proc: Process = {
        name: "Investigación: " + (config.name + " Nv: " + targetLevel),
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
    const proc: Process = {
      name:
        fleet.movementType == "RETURN"
          ? fleetShips + " nave" + (fleetShips > 0 ? "s" : "") + " volviendo a casa"
          : fleetShips + " nave" + (fleetShips > 0 ? "s" : "") + " rumbo al sistema... ",
      type: "FLEET",
      id: "FLEET-" + fleet.id,
      duration: totalTime,
      startedAt: fleet.startTime,

      image: config.imageBackground,
    };

    processes.push(proc);
  });

  return processes;
};
