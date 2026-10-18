import type { House } from "../models/House";
import type { ManaQuality } from "../models/ManaQuality";

export interface HouseAssignmentSpecification {
  readonly house: House;
  isSatisfiedBy(manaQuality: ManaQuality): boolean;
}

export const regiusCardisSpecification: HouseAssignmentSpecification = {
  house: "RegiusCardis",
  isSatisfiedBy: (manaQuality) => manaQuality.order >= manaQuality.chaos,
};

export const roseSleepSpecification: HouseAssignmentSpecification = {
  house: "RoseSleep",
  isSatisfiedBy: (manaQuality) => manaQuality.chaos > manaQuality.order,
};

export const houseAssignmentSpecifications: readonly HouseAssignmentSpecification[] = [
  regiusCardisSpecification,
  roseSleepSpecification,
];
