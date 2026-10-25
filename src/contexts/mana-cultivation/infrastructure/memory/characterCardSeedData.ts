import { CharacterCard } from "../../domain/models/CharacterCard";
import { GelCost } from "../../domain/models/GelCost";

// 「秘宝の栞」の図鑑に載るキャラクターカード（第20回ヒアリング）。イラストはデザインシステムの Characters の全身ドット絵。
export const characterCards: CharacterCard[] = [
  CharacterCard.create({
    id: "card-amou",
    number: 1,
    name: "天羽",
    furigana: "アモウ",
    title: "銀翼のキャプテン",
    flavor: "「一本のシュートも、一問の計算も、決めるまで走り続ける。それがキャプテンだ！」",
    rarity: 3,
    attribute: "Math",
    imageUrl: "/images/characters/amou-full.png",
    cost: GelCost.create("Math", 30),
  }),
  CharacterCard.create({
    id: "card-kageshima",
    number: 2,
    name: "影島",
    furigana: "カゲシマ",
    title: "放課後のギタリスト",
    flavor: "「…歌詞の意味がわかると、音が変わるんだ。英語、ちょっとだけ好きになった」",
    rarity: 3,
    attribute: "English",
    imageUrl: "/images/characters/kageshima-full.png",
    cost: GelCost.create("English", 30),
  }),
];
