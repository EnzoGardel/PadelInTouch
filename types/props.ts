import { Sede } from "./sede";

export type SedeCardProps = {
  sede: Sede;
  selected: boolean;
  onSelect: (id: string) => void;
};
