import background from "../../assets/images/background.jpg";
import backgroundMenu from "../../assets/images/backgroundMenu.jpg";
import unterraformed from "../../assets/images/hex/unterraformed.png";
import backgroundQuest from "../../assets/images/nebulosa.png";

import antennaBackground from "../../assets/images/buildings/antenna.png";
import baseBackground from "../../assets/images/buildings/base.png";
import crystalmineBackground from "../../assets/images/buildings/crystal.png";
import energyBackground from "../../assets/images/buildings/energy.png";
import greenhouseBackground from "../../assets/images/buildings/greenhouse.png";
import hangarBackground from "../../assets/images/buildings/hangar.png";
import labBackground from "../../assets/images/buildings/lab.png";
import metallurgyBackground from "../../assets/images/buildings/metal.png";
import quarryBackground from "../../assets/images/buildings/mining.png";
import recycleBackground from "../../assets/images/buildings/recycle.png";
import residueBackground from "../../assets/images/buildings/residue.png";
import rocketBackground from "../../assets/images/buildings/rocket.png";
import spaceStation from "../../assets/images/buildings/spaceStation.png";
import waterBackground from "../../assets/images/buildings/water.png";

import energy from "../../assets/images/research/Energy.png";
import fuel from "../../assets/images/research/Fuel.png";
import gravity from "../../assets/images/research/Gravity.png";
import laser from "../../assets/images/research/Laser.png";
import mining from "../../assets/images/research/Mining.png";
import plasma from "../../assets/images/research/Plasma.png";
import shield from "../../assets/images/research/Shield.png";
import ships from "../../assets/images/research/Ships.png";
import terraforming from "../../assets/images/research/Terraforming.png";
import water from "../../assets/images/research/Water.png";

import assaultBattleshipBackground from "../../assets/images/ship/assaultBattleshipBackground.png";
import battleCruiserBackground from "../../assets/images/ship/battleCruiserBackground.png";
import escrotFrigateBackground from "../../assets/images/ship/escrotFrigateBackground.png";
import freighterBackground from "../../assets/images/ship/freighterBackground.png";
import heavyAssaultShipBackground from "../../assets/images/ship/heavyAssaultShipBackground.png";
import interceptorBackground from "../../assets/images/ship/interceptorBackground.png";
import lightFighterBackground from "../../assets/images/ship/lightFighterBackground.png";
import orbitalAssaultShipBackground from "../../assets/images/ship/orbitalAssaultShipBackground.png";
import planetarDestroyerBackground from "../../assets/images/ship/planetarDestroyerBackground.png";
import probeBackground from "../../assets/images/ship/probeBackground.png";
import spaceDestroyerBackground from "../../assets/images/ship/spaceDestroyerBackground.png";
import starCarrierBackground from "../../assets/images/ship/starCarrierBackground.png";

import binary from "../../assets/images/starSystems/Binary.png";
import deadStar from "../../assets/images/starSystems/DeadStar.png";
import nebula from "../../assets/images/starSystems/Nebula.png";
import redDwarf from "../../assets/images/starSystems/RedDwarf.png";
import supernova from "../../assets/images/starSystems/Supernova.png";
import trinary from "../../assets/images/starSystems/Trinary.png";

import antenna from "../../assets/images/mini/antenna.png";
import base from "../../assets/images/mini/base.png";
import blank from "../../assets/images/mini/blank.png";
import crystal from "../../assets/images/mini/crystal.png";
import greenhouse from "../../assets/images/mini/greenhouse.png";
import hangar from "../../assets/images/mini/hangar.png";
import lab from "../../assets/images/mini/lab.png";
import lunar from "../../assets/images/mini/lunar.png";
import metal from "../../assets/images/mini/metal.png";
import plant from "../../assets/images/mini/plant.png";
import recycle from "../../assets/images/mini/recycle.png";
import regolith from "../../assets/images/mini/regolith.png";
import residue from "../../assets/images/mini/residue.png";
import rocket from "../../assets/images/mini/rocket.png";
import spaceStationBase from "../../assets/images/mini/spaceStation.png";
import underConstruction from "../../assets/images/mini/underConstruction.png";
import underConstructionBase from "../../assets/images/mini/underconstructionBase.png";
import waterExtractor from "../../assets/images/mini/water.png";
import waterDrop from "../../assets/images/waterDrop.png";

import alienTechFound from "../../assets/images//quests/alienTechFound.png";
import waterFound from "../../assets/images//quests/waterFound.png";
import waterSearch from "../../assets/images/quests/waterSearch.png";
import backgroundCluster from "../../assets/images/starSystems/backgroundCluster.png";
import backgroundGalaxy from "../../assets/images/starSystems/backgroundGalaxy.png";
import backgroundRegion from "../../assets/images/starSystems/backgroundRegion.png";

export const IMAGES = {
  //IMAGENES GENERALES
  BACKGROUND_IMAGE: background,
  BACKGROUND_MENU_IMAGE: backgroundMenu,
  BACKGROUND_QUEST_IMAGE: backgroundQuest,
  BACKGROUND_CLUSTER: backgroundCluster,
  BACKGROUND_GALAXY: backgroundGalaxy,
  BACKGROUND_REGION: backgroundRegion,
  WATER_DROP: waterDrop,
  //QUESTS
  H2O_SEARCH: waterSearch,
  H2O_FOUND: waterFound,
  ALIEN_TECH_FOUND: alienTechFound,
  // EDIFICIOS
  BUILDING_BASE: base,
  BUILDING_LAB: lab,
  BUILDING_MINING: regolith,
  BUILDING_METAL: metal,
  BUILDING_CRYSTAL: crystal,
  BUILDING_ENERGY: plant,
  BUILDING_ROCKET: rocket,
  BUILDING_HANGAR: hangar,
  BUILDING_ANTENNA: antenna,
  BUILDING_RECYCLE: recycle,
  BUILDING_GREENHOUSE: greenhouse,
  BUILDING_SPACESTATION: spaceStationBase,
  BUILDING_UNDER_CONSTRUCTION: underConstruction,
  BUILDING_UNDER_CONSTRUCTION_BASE: underConstructionBase,
  BUILDING_WATEREXTRACTOR: waterExtractor,
  BUILDING_RESIDUE: residue,
  HEX_LUNAR: lunar,
  RESEARCH_MINING: mining,
  RESEARCH_TERRAFORMING: terraforming,
  RESEARCH_WATER: water,
  RESEARCH_FUEL: fuel,
  RESEARCH_ENERGY: energy,
  RESEARCH_SHIPS: ships,
  LAB_BACKGROUND: labBackground,
  METALLURGY_BACKGROUND: metallurgyBackground,
  QUARRY_BACKGROUND: quarryBackground,
  KRYSTALMINE_BACKGROUND: crystalmineBackground,
  GREENHOUSE_BACKGROUND: greenhouseBackground,
  BASE_BACKGROUND: baseBackground,
  HANGAR_BACKGROUND: hangarBackground,
  ROCKET_BACKGROUND: rocketBackground,
  ANTENNA_BACKGROUND: antennaBackground,
  ENERGY_BACKGROUND: energyBackground,
  RECYCLE_BACKGROUND: recycleBackground,
  RESIDUE_BACKGROUND: residueBackground,
  WATEREXTRACTOR_BACKGROUND: waterBackground,
  SHIP_BG_PROBE: probeBackground,
  SHIP_BG_LIGHTFIGHTER: lightFighterBackground,
  SHIP_BG_INTERCEPTOR: interceptorBackground,
  SHIP_BG_ESCORTFRIGATE: escrotFrigateBackground,
  SHIP_BG_BATTLECRUISER: battleCruiserBackground,
  SHIP_BG_SPACEDESTROYER: spaceDestroyerBackground,
  SHIP_BG_ASSAULTBATTLESHIP: assaultBattleshipBackground,
  SHIP_BG_STARCARRIER: starCarrierBackground,
  SHIP_BG_HEAVYASSAULTSHIP: heavyAssaultShipBackground,
  SHIP_BG_ORBITALASSAULTSHIP: orbitalAssaultShipBackground,
  SHIP_BG_PLANETARYDESTROYER: planetarDestroyerBackground,
  SHIP_BG_FREIGHTER: freighterBackground,
  RESEARCH_LASER: laser,
  RESEARCH_PLASMA: plasma,
  RESEARCH_SHIELD: shield,
  RESEARCH_GRAVITY: gravity,
  SPACESTATION_BACKGROUND: spaceStation,
  BINARY: binary,
  TRINARY: trinary,
  SUPERNOVA_REMNANT: supernova,
  DEAD_STAR: deadStar,
  RED_DWARF: redDwarf,
  NEBULA: nebula,
  BLANK: blank,
  UNTERRAFORMED: unterraformed,
};
