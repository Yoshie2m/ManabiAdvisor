import type { ReactNode } from "react";

import type { House } from "@/contexts/house-assignment/domain/models/House";

const DATA_THEME_BY_HOUSE: Record<House, "regiuscardis" | "rosesleep"> = {
  RegiusCardis: "regiuscardis",
  RoseSleep: "rosesleep",
};

type ThemeProviderProps = {
  house: House;
  children: ReactNode;
};

export function ThemeProvider({ house, children }: ThemeProviderProps) {
  return <div data-theme={DATA_THEME_BY_HOUSE[house]}>{children}</div>;
}
