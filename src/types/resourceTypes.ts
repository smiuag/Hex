export type ResourceType = "METAL" | "STONE" | "ENERGY" | "CRYSTAL";
export type SpecialResourceType = "ILMENITA" | "REGOLITO" | "THARNIO" | "KAIROX" | "NEBULITA";

export type Resources = Record<ResourceType, number>;
export type SpecialResources = Record<SpecialResourceType, number>;

export type StoredResources = {
  resources: Partial<Resources>;
  lastUpdate: number;
  production: Partial<Resources>;
};

export type ResourceChance = [number, [number, number]]; // [%, [min, max]]
export type CombinedResources = Partial<Record<ResourceType | SpecialResourceType, number>>;
