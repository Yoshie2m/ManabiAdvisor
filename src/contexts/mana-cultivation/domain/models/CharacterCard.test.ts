import { describe, expect, it } from "vitest";

import { CharacterCard, type CharacterCardProps } from "./CharacterCard";
import { GelCost } from "./GelCost";

const props: CharacterCardProps = {
  id: "card-amou",
  number: 1,
  name: "天羽",
  furigana: "アモウ",
  title: "銀翼のキャプテン",
  flavor: "「決めるまで走り続ける」",
  rarity: 3,
  attribute: "Math",
  imageUrl: "/images/characters/amou-full.png",
  cost: GelCost.create("Math", 30),
};

describe("CharacterCard", () => {
  it("keeps its fields", () => {
    const card = CharacterCard.create(props);

    expect(card.id).toBe("card-amou");
    expect(card.number).toBe(1);
    expect(card.rarity).toBe(3);
    expect(card.cost.count).toBe(30);
  });

  it.each(["", "  "])("rejects an empty name %j", (name) => {
    expect(() => CharacterCard.create({ ...props, name })).toThrow();
  });

  it.each([-1, 6, 2.5])("rejects rarity %s", (rarity) => {
    expect(() => CharacterCard.create({ ...props, rarity })).toThrow();
  });

  it.each([0, -3, 1.5])("rejects number %s", (number) => {
    expect(() => CharacterCard.create({ ...props, number })).toThrow();
  });

  it.each([0, 5])("accepts boundary rarity %s", (rarity) => {
    expect(CharacterCard.create({ ...props, rarity }).rarity).toBe(rarity);
  });
});
