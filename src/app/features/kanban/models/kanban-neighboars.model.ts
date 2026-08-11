import { Direction } from '@shared/models/direction.model';

export class Neighbour implements Record<Direction, string | null> {
  up: string | null = null;
  down: string | null = null;
  left: string | null = null;
  right: string | null = null;
}
export type Neighbours = Record<string, Neighbour>;
