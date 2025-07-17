export type ResourceType = "metal" | "stone" | "energy" | "crystal";

export type Resources = Record<ResourceType, number>;

export type StoredResources = {
  resources: Resources;
  lastUpdate: number;
};
