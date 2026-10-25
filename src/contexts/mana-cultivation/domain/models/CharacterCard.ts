import type { GelCost } from "./GelCost";
import type { Subject } from "./Subject";

export type CharacterCardProps = {
  id: string;
  number: number;
  name: string;
  furigana: string;
  title: string;
  flavor: string;
  rarity: number;
  attribute: Subject;
  imageUrl: string;
  cost: GelCost;
};

// 「秘宝の栞」の図鑑に載るキャラクターカード。ステータス・スキルは持たない（第20回ヒアリング）。
export class CharacterCard {
  private constructor(
    readonly id: string,
    readonly number: number,
    readonly name: string,
    readonly furigana: string,
    readonly title: string,
    readonly flavor: string,
    readonly rarity: number,
    readonly attribute: Subject,
    readonly imageUrl: string,
    readonly cost: GelCost,
  ) {}

  static create(props: CharacterCardProps): CharacterCard {
    if (props.name.trim().length === 0) {
      throw new Error("CharacterCard.name must not be empty");
    }
    if (!Number.isInteger(props.number) || props.number < 1) {
      throw new Error("CharacterCard.number must be a positive integer");
    }
    if (!Number.isInteger(props.rarity) || props.rarity < 0 || props.rarity > 5) {
      throw new Error("CharacterCard.rarity must be an integer between 0 and 5");
    }
    return new CharacterCard(
      props.id,
      props.number,
      props.name,
      props.furigana,
      props.title,
      props.flavor,
      props.rarity,
      props.attribute,
      props.imageUrl,
      props.cost,
    );
  }
}
