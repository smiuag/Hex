export type ResourceType = "metal" | "stone" | "energy" | "crystal";
export type Resources = Record<ResourceType, number>;

export type StoredResources = {
  resources: Partial<Resources>;
  lastUpdate: number;
  production: Partial<Resources>;
};
