import { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import { LearningUnit } from "../../domain/models/LearningUnit";
import { Question } from "../../domain/models/Question";
import { UpcomingExam } from "../../domain/models/UpcomingExam";

// 動作確認用の仮コンテンツ。本来はFirestoreのコレクション/Cloud Storageに格納する
// （CLAUDE.md の学習コンテンツ配置方針を参照）。DB連携時にこのファイルは廃止する。

export const DEMO_EXAM_TYPE: ExamType = "JuniorHigh2ndYearRegularExam";

export const curricula: Curriculum[] = [
  Curriculum.create({
    id: "curriculum-english",
    examType: DEMO_EXAM_TYPE,
    subject: "English",
    title: "中2英語 定期テスト対策",
  }),
  Curriculum.create({
    id: "curriculum-math",
    examType: DEMO_EXAM_TYPE,
    subject: "Math",
    title: "中2数学 定期テスト対策",
  }),
  Curriculum.create({
    id: "curriculum-japanese",
    examType: DEMO_EXAM_TYPE,
    subject: "Japanese",
    title: "中2国語 定期テスト対策",
  }),
  Curriculum.create({
    id: "curriculum-science",
    examType: DEMO_EXAM_TYPE,
    subject: "Science",
    title: "中2理科 定期テスト対策",
  }),
  Curriculum.create({
    id: "curriculum-social",
    examType: DEMO_EXAM_TYPE,
    subject: "SocialStudies",
    title: "中2社会 定期テスト対策",
  }),
];

export const learningUnits: LearningUnit[] = [
  // PROGRESS 21 Book 2 Lesson 1〜5。各Lessonは2つのScene（文法点）からなる。
  LearningUnit.create(
    { id: "unit-english-l1-s1", curriculumId: "curriculum-english", title: "Lesson 1 Scene 1: 未来を表す表現 (will / be going to)", difficulty: 2 },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l1-s2", curriculumId: "curriculum-english", title: "Lesson 1 Scene 2: 第4文型 (give+人+物)", difficulty: 3 },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l2-s1", curriculumId: "curriculum-english", title: "Lesson 2 Scene 1: 感嘆文 (What / How)", difficulty: 2 },
    "English",
  ),
  LearningUnit.create(
    {
      id: "unit-english-l2-s2",
      curriculumId: "curriculum-english",
      title: "Lesson 2 Scene 2: 接続詞がつくる副詞節 (when / because / if / though)",
      difficulty: 3,
    },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l3-s1", curriculumId: "curriculum-english", title: "Lesson 3 Scene 1: 比較 (as...as / 比較級+than)", difficulty: 2 },
    "English",
  ),
  LearningUnit.create(
    {
      id: "unit-english-l3-s2",
      curriculumId: "curriculum-english",
      title: "Lesson 3 Scene 2: 比較級の変化形 (er / more・不規則変化)",
      difficulty: 3,
    },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l4-s1", curriculumId: "curriculum-english", title: "Lesson 4 Scene 1: 最上級の表現 (the+最上級)", difficulty: 2 },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l4-s2", curriculumId: "curriculum-english", title: "Lesson 4 Scene 2: 最上級の範囲・対象 (in / of)", difficulty: 3 },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l5-s1", curriculumId: "curriculum-english", title: "Lesson 5 Scene 1: 前置詞 with の識別", difficulty: 3 },
    "English",
  ),
  LearningUnit.create(
    { id: "unit-english-l5-s2", curriculumId: "curriculum-english", title: "Lesson 5 Scene 2: 付帯状況の基礎", difficulty: 4 },
    "English",
  ),
  // 体系数学2 代数編。各節を1ユニットとする。
  LearningUnit.create(
    { id: "unit-math-c1-s1", curriculumId: "curriculum-math", title: "第1章 式の計算 1: 多項式の計算", difficulty: 2 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c1-s2", curriculumId: "curriculum-math", title: "第1章 式の計算 2: 因数分解", difficulty: 3 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c1-s3", curriculumId: "curriculum-math", title: "第1章 式の計算 3: 式の計算の利用", difficulty: 3 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c6-s1", curriculumId: "curriculum-math", title: "第6章 確率と標本調査 1: 場合の数", difficulty: 2 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c6-s2", curriculumId: "curriculum-math", title: "第6章 確率と標本調査 2: 事柄の起こりやすさと確率", difficulty: 2 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c6-s3", curriculumId: "curriculum-math", title: "第6章 確率と標本調査 3: 確率の計算", difficulty: 3 },
    "Math",
  ),
  LearningUnit.create(
    { id: "unit-math-c6-s4", curriculumId: "curriculum-math", title: "第6章 確率と標本調査 4: 標本調査", difficulty: 2 },
    "Math",
  ),
  // 数学の出題形式別ユニット（計算問題・文章題）。
  LearningUnit.create(
    {
      id: "unit-math-calc-1",
      curriculumId: "curriculum-math",
      title: "第1章 式の計算 計算問題",
      difficulty: 2,
      questionType: "Calculation",
    },
    "Math",
  ),
  LearningUnit.create(
    {
      id: "unit-math-word-1",
      curriculumId: "curriculum-math",
      title: "第6章 確率と標本調査 文章題",
      difficulty: 3,
      questionType: "WordProblem",
    },
    "Math",
  ),
  // 国語の学習2（浜島書店）読解3篇。
  LearningUnit.create(
    { id: "unit-japanese-reading-1", curriculumId: "curriculum-japanese", title: "国語の学習2: 走れメロス（小説）", difficulty: 2 },
    "Japanese",
  ),
  LearningUnit.create(
    { id: "unit-japanese-reading-2", curriculumId: "curriculum-japanese", title: "国語の学習2: 孔子の言葉（漢文）", difficulty: 3 },
    "Japanese",
  ),
  LearningUnit.create(
    { id: "unit-japanese-reading-3", curriculumId: "curriculum-japanese", title: "国語の学習2: ガイアの知性（説明文）", difficulty: 3 },
    "Japanese",
  ),
  // 中学国文法のドリル（吉野教育図書）。
  LearningUnit.create(
    { id: "unit-japanese-grammar-1", curriculumId: "curriculum-japanese", title: "中学国文法のドリル: 助詞", difficulty: 2 },
    "Japanese",
  ),
  LearningUnit.create(
    { id: "unit-japanese-grammar-2", curriculumId: "curriculum-japanese", title: "中学国文法のドリル: 助動詞", difficulty: 2 },
    "Japanese",
  ),
  LearningUnit.create(
    { id: "unit-japanese-grammar-3", curriculumId: "curriculum-japanese", title: "中学国文法のドリル: 敬語の用法", difficulty: 2 },
    "Japanese",
  ),
  LearningUnit.create(
    {
      id: "unit-japanese-grammar-4",
      curriculumId: "curriculum-japanese",
      title: "中学国文法のドリル: 紛らわしい品詞の見分け方",
      difficulty: 3,
    },
    "Japanese",
  ),
  // ロジカル国語表現Ⅰ（好学出版）。
  LearningUnit.create(
    { id: "unit-japanese-logical-1", curriculumId: "curriculum-japanese", title: "ロジカル国語表現Ⅰ: 対比", difficulty: 2 },
    "Japanese",
  ),
  // 暗唱・漢字。
  LearningUnit.create(
    { id: "unit-japanese-poem-1", curriculumId: "curriculum-japanese", title: "百人一首（暗唱）", difficulty: 2 },
    "Japanese",
  ),
  LearningUnit.create(
    {
      id: "unit-japanese-kanji-1",
      curriculumId: "curriculum-japanese",
      title: "ステップ別常用漢字（浜島書店）: 常用漢字（範囲未定）",
      difficulty: 1,
    },
    "Japanese",
  ),
  // 漢字小テストI（全56問、書き・読みの2形式）。小テストII・IIIは後日追加予定。
  LearningUnit.create(
    {
      id: "unit-japanese-kanji-test1-write",
      curriculumId: "curriculum-japanese",
      title: "漢字小テストI（書き）",
      difficulty: 3,
      questionType: "KanjiWriting",
    },
    "Japanese",
  ),
  LearningUnit.create(
    {
      id: "unit-japanese-kanji-test1-read",
      curriculumId: "curriculum-japanese",
      title: "漢字小テストI（読み）",
      difficulty: 2,
      questionType: "KanjiReading",
    },
    "Japanese",
  ),
  // 徹底演習テキスト 中2（受験研究社）単元4 電流とその利用。各節を1ユニットとする。
  LearningUnit.create(
    { id: "unit-science-u4-c1-s1", curriculumId: "curriculum-science", title: "1章 電流の性質 1: 電流が流れる道すじ", difficulty: 1 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c1-s2", curriculumId: "curriculum-science", title: "1章 電流の性質 2: 回路に流れる電流", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c1-s3", curriculumId: "curriculum-science", title: "1章 電流の性質 3: 回路に加わる電圧", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c1-s4", curriculumId: "curriculum-science", title: "1章 電流の性質 4: 電圧と電流の関係", difficulty: 3 },
    "Science",
  ),
  LearningUnit.create(
    {
      id: "unit-science-u4-c1-s5",
      curriculumId: "curriculum-science",
      title: "1章 電流の性質 5: 電流、電圧、電気抵抗の求め方",
      difficulty: 4,
    },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c1-s6", curriculumId: "curriculum-science", title: "1章 電流の性質 6: 電流のはたらきを表す量", difficulty: 3 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c2-s1", curriculumId: "curriculum-science", title: "2章 電流の正体 1: 静電気", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c2-s2", curriculumId: "curriculum-science", title: "2章 電流の正体 2: 静電気と電流の関係", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c2-s3", curriculumId: "curriculum-science", title: "2章 電流の正体 3: 電流の正体", difficulty: 3 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c2-s4", curriculumId: "curriculum-science", title: "2章 電流の正体 4: 放射線の発見とその利用", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c3-s1", curriculumId: "curriculum-science", title: "3章 電流と磁界 1: 磁界", difficulty: 2 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c3-s2", curriculumId: "curriculum-science", title: "3章 電流と磁界 2: モーターのしくみ", difficulty: 3 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-science-u4-c3-s3", curriculumId: "curriculum-science", title: "3章 電流と磁界 3: 発電機のしくみ", difficulty: 3 },
    "Science",
  ),
  // ウイニング 歴史Ⅰ・Ⅱ（好学出版）「中学社会 歴史」第4章 近世の日本と世界。各節を1ユニットとする。
  LearningUnit.create(
    { id: "unit-social-c4-s1", curriculumId: "curriculum-social", title: "第4章 近世の日本と世界 1: 結びつく世界との出会い", difficulty: 2 },
    "SocialStudies",
  ),
  LearningUnit.create(
    { id: "unit-social-c4-s2", curriculumId: "curriculum-social", title: "第4章 近世の日本と世界 2: 天下統一への歩み", difficulty: 2 },
    "SocialStudies",
  ),
  LearningUnit.create(
    { id: "unit-social-c4-s3", curriculumId: "curriculum-social", title: "第4章 近世の日本と世界 3: 幕藩体制の確立と鎖国", difficulty: 3 },
    "SocialStudies",
  ),
];

export const upcomingExams: UpcomingExam[] = [
  new UpcomingExam("exam-2nd-midterm", DEMO_EXAM_TYPE, new Date("2026-11-15"), [
    "unit-english-l1-s1",
    "unit-english-l1-s2",
    "unit-english-l2-s1",
    "unit-english-l2-s2",
    "unit-math-c1-s1",
    "unit-math-c1-s2",
    "unit-math-c1-s3",
    "unit-science-u4-c1-s1",
    "unit-science-u4-c1-s2",
    "unit-science-u4-c1-s3",
    "unit-science-u4-c1-s4",
    "unit-science-u4-c1-s5",
    "unit-science-u4-c1-s6",
    "unit-social-c4-s1",
    "unit-social-c4-s2",
    "unit-social-c4-s3",
  ]),
];

// 漢字小テストI（第一回）の原本データ。書き（文中のカタカナ→漢字）と
// 読み（漢字→ひらがな）の両テストを、この1つの語彙リストから生成する。
// 読みは原文のカタカナ部分をそのままひらがなに変換したもの（ふりがなデータは
// 原本に含まれていないが、設問文中のカタカナ自体が読みと一致するため導出できる）。
// 小テストII・IIIは別途データが揃った時点で同じ形で追加する。
const KANJI_TEST_1_ITEMS: { sentence: string; kanji: string; reading: string }[] = [
  { sentence: "人生のヒアイを見る。", kanji: "悲哀", reading: "ひあい" },
  { sentence: "アワレミの表情。", kanji: "哀れみ", reading: "あわれみ" },
  { sentence: "会社のイアン旅行。", kanji: "慰安", reading: "いあん" },
  { sentence: "傷心の友をナグサめる。", kanji: "慰", reading: "なぐさ" },
  { sentence: "詩をロウエイする。", kanji: "朗詠", reading: "ろうえい" },
  { sentence: "一人でエツに入る。", kanji: "悦", reading: "えつ" },
  { sentence: "図書館のエツランする。", kanji: "閲覧", reading: "えつらん" },
  { sentence: "城がエンジョウする。", kanji: "炎上", reading: "えんじょう" },
  { sentence: "ホノオに包まれる。", kanji: "炎", reading: "ほのお" },
  { sentence: "にぎやかなエンカイ。", kanji: "宴会", reading: "えんかい" },
  { sentence: "オウベイ諸国との貿易。", kanji: "欧米", reading: "おうべい" },
  { sentence: "力いっぱいナグる。", kanji: "殴", reading: "なぐ" },
  { sentence: "コウオツ付けがたい。", kanji: "甲乙", reading: "こうおつ" },
  { sentence: "小売店に品物をオロす。", kanji: "卸", reading: "おろ" },
  { sentence: "オロシドンヤの主人。", kanji: "卸問屋", reading: "おろしどんや" },
  { sentence: "オンワな性格の人。", kanji: "温和", reading: "おんわ" },
  { sentence: "オダヤカな気候。", kanji: "穏やか", reading: "おだやか" },
  { sentence: "カサクに入選する。", kanji: "佳作", reading: "かさく" },
  { sentence: "カクウの話をする。", kanji: "架空", reading: "かくう" },
  { sentence: "橋をカける。", kanji: "架", reading: "か" },
  { sentence: "ゴウカな調度品。", kanji: "豪華", reading: "ごうか" },
  { sentence: "ハナヤカな衣装。", kanji: "華やか", reading: "はなやか" },
  { sentence: "ハナヨメ衣装を調える。", kanji: "花嫁", reading: "はなよめ" },
  { sentence: "姉が他家にトツぐ。", kanji: "嫁", reading: "とつ" },
  { sentence: "食糧難でガシする。", kanji: "餓死", reading: "がし" },
  { sentence: "夏の夜のカイダン話。", kanji: "怪談", reading: "かいだん" },
  { sentence: "人にアヤしまれる。", kanji: "怪", reading: "あや" },
  { sentence: "コウカイ先に立たず。", kanji: "後悔", reading: "こうかい" },
  { sentence: "過ぎ去ったことをクやむ。", kanji: "悔", reading: "く" },
  { sentence: "クヤシイ思いをする。", kanji: "悔しい", reading: "くやしい" },
  { sentence: "キンカイを輸送する。", kanji: "金塊", reading: "きんかい" },
  { sentence: "巨大な肉のカタマリ。", kanji: "塊", reading: "かたまり" },
  { sentence: "カンガイ無量になる。", kanji: "感慨", reading: "かんがい" },
  { sentence: "ガイトウシャがいない。", kanji: "該当者", reading: "がいとうしゃ" },
  { sentence: "計画のガイリャクを話す。", kanji: "概略", reading: "がいりゃく" },
  { sentence: "鉛筆でリンカクを描く。", kanji: "輪郭", reading: "りんかく" },
  { sentence: "他からカクリされた空間。", kanji: "隔離", reading: "かくり" },
  { sentence: "道をヘダてた向かい側。", kanji: "隔", reading: "へだ" },
  { sentence: "大きなシュウカクだ。", kanji: "収穫", reading: "しゅうかく" },
  { sentence: "中部地方のサンガク地帯。", kanji: "山岳", reading: "さんがく" },
  { sentence: "谷川ダケを縦走する。", kanji: "岳", reading: "だけ" },
  { sentence: "ベンチに腰をカける。", kanji: "掛", reading: "か" },
  { sentence: "駅のシュッサツがかり。", kanji: "出札", reading: "しゅっさつ" },
  { sentence: "物事がエンカツに進む。", kanji: "円滑", reading: "えんかつ" },
  { sentence: "氷の上をスベる。", kanji: "滑", reading: "すべ" },
  { sentence: "ナメラカな曲線を描く。", kanji: "滑らか", reading: "なめらか" },
  { sentence: "カンゾウを患う。", kanji: "肝臓", reading: "かんぞう" },
  { sentence: "キモに銘ずる。", kanji: "肝", reading: "きも" },
  { sentence: "カンコン葬祭の手引き。", kanji: "冠婚", reading: "かんこん" },
  { sentence: "黄金のカンムリ。", kanji: "冠", reading: "かんむり" },
  { sentence: "カンチがいも甚だしい。", kanji: "勘違", reading: "かんち" },
  { sentence: "トンネルがカンツウした。", kanji: "貫通", reading: "かんつう" },
  { sentence: "初志をツラヌく。", kanji: "貫", reading: "つらぬ" },
  { sentence: "注意をカンキする。", kanji: "喚起", reading: "かんき" },
  { sentence: "方向をテンカンする。", kanji: "転換", reading: "てんかん" },
  { sentence: "電車を乗りカえる。", kanji: "換", reading: "か" },
];

const kanjiTest1WriteQuestions: Question[] = KANJI_TEST_1_ITEMS.map((item, index) =>
  Question.create({
    id: `q-japanese-kanji-test1-write-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-japanese-kanji-test1-write",
    prompt: item.sentence,
    answer: item.kanji,
  }),
);

const kanjiTest1ReadQuestions: Question[] = KANJI_TEST_1_ITEMS.map((item, index) =>
  Question.create({
    id: `q-japanese-kanji-test1-read-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-japanese-kanji-test1-read",
    prompt: item.kanji,
    answer: item.reading,
  }),
);

// 数学の出題形式別ユニット（unit-math-calc-1 / unit-math-word-1）向けの実際の問題例。
export const questions: Question[] = [
  Question.create({
    id: "q-math-calc-1",
    learningUnitId: "unit-math-calc-1",
    prompt: "(x+3)(x-5) を展開しなさい。",
    answer: "x^2 - 2x - 15",
  }),
  Question.create({
    id: "q-math-calc-2",
    learningUnitId: "unit-math-calc-1",
    prompt: "x^2 - 9 を因数分解しなさい。",
    answer: "(x+3)(x-3)",
  }),
  Question.create({
    id: "q-math-calc-3",
    learningUnitId: "unit-math-calc-1",
    prompt: "2x^2 + 7x + 3 を因数分解しなさい。",
    answer: "(2x+1)(x+3)",
  }),
  Question.create({
    id: "q-math-word-1",
    learningUnitId: "unit-math-word-1",
    prompt: "大小2つのさいころを同時に投げるとき、出る目の数の和が7になる確率を求めなさい。",
    answer: "1/6（36通り中6通り）",
  }),
  Question.create({
    id: "q-math-word-2",
    learningUnitId: "unit-math-word-1",
    prompt: "1から9までの数字が1つずつ書かれた9枚のカードから1枚引くとき、引いたカードが3の倍数である確率を求めなさい。",
    answer: "1/3（9枚中3枚）",
  }),
  ...kanjiTest1WriteQuestions,
  ...kanjiTest1ReadQuestions,
];
