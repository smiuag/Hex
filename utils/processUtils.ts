import { researchTechnologies } from "../src/config/researchConfig";
import { Hex } from "../src/types/hexTypes";
import { Process } from "../src/types/processTypes";
import { Research } from "../src/types/researchTypes";
import { getBuildTime } from "../utils/buildingUtils";
import { getResearchTime } from "../utils/researchUtils";

export const getBuildingProcesses = (hexes: Hex[]): Process[] => {
  const processes: Process[] = [];

  hexes.forEach((hex) => {
    if (hex.construction) {
      const targetLevel = hex.construction.targetLevel ?? 1;
      const duration = getBuildTime(hex.construction.building, targetLevel);

      const startedAt = hex.construction.startedAt ?? 0;

      const proc: Process = {
        name:
          hex.construction.targetLevel == 1
            ? `Mejora de ${hex.construction.building} a nivel ${targetLevel}`
            : `Construcción de ${hex.construction.building}`,
        type: "BUILDING",
        id: "BUILDING-" + `${hex.q}-${hex.r}`,
        startedAt,
        duration,
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
      const type = researchTechnologies[r.data.type];
      const startedAt = r.progress.startedAt ?? 0;

      const proc: Process = {
        name: "Investigación: " + type.name + " Nv: " + targetLevel,
        type: "RESEARCH",
        id: "RESEARCH-" + r.data.type,
        researchType: r.data.type,
        startedAt,
        duration,
      };

      processes.push(proc);
    }
  });

  return processes;
};
