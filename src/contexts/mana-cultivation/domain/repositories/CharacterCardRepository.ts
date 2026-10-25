import type { CharacterCard } from "../models/CharacterCard";

export interface CharacterCardRepository {
  findAll(): Promise<CharacterCard[]>;
  findById(id: string): Promise<CharacterCard | null>;
}
