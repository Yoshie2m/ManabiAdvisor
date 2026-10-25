import { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import { LearningUnit } from "../../domain/models/LearningUnit";
import { Question } from "../../domain/models/Question";
import { UpcomingExam } from "../../domain/models/UpcomingExam";
import { preSocialCurriculum, preSocialLearningUnits, preSocialQuestions } from "./preSocialSeedData";

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
  preSocialCurriculum,
];

// Lesson 2 Scene 1（感嘆文）の本文・文法ポイント。採点対象の問題ではなく、
// クイズ開始前に読み物として表示する参照用テキスト（ユーザー提供の
// L2-S1.txtに基づく）。referenceAudioUrl（下記）は、この会話文のうち
// 英語セリフ部分のみ（ト書き・日本語訳を除く）をgTTSで読み上げた音声
// （public/audio/lesson2-scene1.mp3、生成に使ったスクリプトは一時ファイルで
// リポジトリには残していない）。第15回ヒアリング参照。
const LESSON2_SCENE1_REFERENCE_TEXT = `【文法】感嘆文：驚き・喜び・悲しみなどの感情を表す文
・なんて～なのだろう。 → [ How + 形容詞/副詞 ! ]
・なんて～な……なのだろう。 → [ What (a/an) + 形容詞 + 名詞 [ + S V ] ! ]

【会話文】
Tom: Happy birthday, Grandma!
(He hands her the roses.) （彼女にバラを手渡す）
Grandma: Oh my! What beautiful roses! （なんてきれいなバラだろう！） Thank you so much, Tom!
(Grandma takes the flowers and kisses Tom.)
Mary: Happy birthday, Grandma!
(Mary kisses Grandma and gives her the large present.)
Grandma: Oh, thank you! (She opens it.) Oh, what a beautiful painting! （絵画）
Mary: It's just a poster, but I found a nice frame for it. （額縁）
Grandma: Oh, what lovely colors! It'll look perfect on that wall.

【場面（point）】
・It's Grandma's birthday.
・Tom and Mary are waiting for her in the living room.
・Tom is holding a dozen roses and there is a large present on the table.`;

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
    {
      id: "unit-english-l2-s1",
      curriculumId: "curriculum-english",
      title: "Lesson 2 Scene 1: 感嘆文 (What / How)",
      difficulty: 2,
      referenceText: LESSON2_SCENE1_REFERENCE_TEXT,
      referenceAudioUrl: "/audio/lesson2-scene1.mp3",
    },
    "English",
  ),
  // Lesson 2 Scene 1の例文練習（感嘆文の英作文、全3問）。文法単元
  // (unit-english-l2-s1) とは別の、QuestionTypeを持つ単元として登録する
  // （第4回・第6回・第8回・第10回ヒアリングの方針に従う）。
  LearningUnit.create(
    {
      id: "unit-english-l2-s1-practice",
      curriculumId: "curriculum-english",
      title: "Lesson 2 Scene 1 例文練習（感嘆文の英作文）",
      difficulty: 3,
      questionType: "PassageTranslationToEnglish",
    },
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
  // 単語マスターI（Lesson 2 新出語彙、全99語）。4択クイズ形式。
  LearningUnit.create(
    {
      id: "unit-english-vocab-1",
      curriculumId: "curriculum-english",
      title: "単語マスターI（Lesson 2 新出語彙）",
      difficulty: 2,
      questionType: "VocabularyTest",
    },
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
  // 漢字小テストI（全56問、書き・読みの2形式）。小テストIIIは後日追加予定。
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
  // 漢字小テストII（全77問、書き・読みの2形式）。
  LearningUnit.create(
    {
      id: "unit-japanese-kanji-test2-write",
      curriculumId: "curriculum-japanese",
      title: "漢字小テストII（書き）",
      difficulty: 3,
      questionType: "KanjiWriting",
    },
    "Japanese",
  ),
  LearningUnit.create(
    {
      id: "unit-japanese-kanji-test2-read",
      curriculumId: "curriculum-japanese",
      title: "漢字小テストII（読み）",
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
  ...preSocialLearningUnits,
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

// 漢字小テストII（第二回）の原本データ。書き（文中のカタカナ→漢字）と
// 読み（漢字→ひらがな）の両テストを、この1つの語彙リストから生成する。
// 小テストIとは異なり、原文のカタカナの一部（7問）が熟語の正しい読みと
// 一致していなかった（濁点の誤り等、ソースの表記ゆれ・誤記と判断）。該当する
// 7問（2, 7, 16, 23, 30, 31, 33番）は、ユーザー確認のうえ熟語の正しい読みを
// readingに採用し、文中のカタカナ（書きテストの問題文）はソースのまま変更していない。
const KANJI_TEST_2_ITEMS: { sentence: string; kanji: string; reading: string }[] = [
  { sentence: "ユウカンに闘う。", kanji: "勇敢", reading: "ゆうかん" },
  { sentence: "警報がカレイする。", kanji: "緩和", reading: "かんわ" },
  { sentence: "警戒をユルメル。", kanji: "緩める", reading: "ゆるめる" },
  { sentence: "文化祭のキカクを練る。", kanji: "企画", reading: "きかく" },
  { sentence: "事業をクワダてる。", kanji: "企", reading: "くわだ" },
  { sentence: "キチュウと書いた紙。", kanji: "忌中", reading: "きちゅう" },
  { sentence: "衛星のギドウを正す。", kanji: "軌道", reading: "きどう" },
  { sentence: "キセイの事実となる。", kanji: "既成", reading: "きせい" },
  { sentence: "その事はスデに連絡した。", kanji: "既に", reading: "すで" },
  { sentence: "祖父にショウギを習う。", kanji: "将棋", reading: "しょうぎ" },
  { sentence: "権利をホウキする。", kanji: "放棄", reading: "ほうき" },
  { sentence: "運動会のキバ戦。", kanji: "騎馬", reading: "きば" },
  { sentence: "サギの容疑者が捕まる。", kanji: "詐欺", reading: "さぎ" },
  { sentence: "敵をアザムク作戦を練る。", kanji: "欺く", reading: "あざむく" },
  { sentence: "ギセイ的精神。", kanji: "犠牲", reading: "ぎせい" },
  { sentence: "かわいいのギクの花。", kanji: "菊", reading: "きく" },
  { sentence: "勝利のキッポウが届く。", kanji: "吉報", reading: "きっぽう" },
  { sentence: "フキツな予感がする。", kanji: "不吉", reading: "ふきつ" },
  { sentence: "キツエンを禁じる。", kanji: "喫煙", reading: "きつえん" },
  { sentence: "動物をギャクタイする。", kanji: "虐待", reading: "ぎゃくたい" },
  { sentence: "キョエイシンを捨てる。", kanji: "虚栄心", reading: "きょえいしん" },
  { sentence: "船でカイキョウを渡る。", kanji: "海峡", reading: "かいきょう" },
  { sentence: "キョワク状が届く。", kanji: "脅迫", reading: "きょうはく" },
  { sentence: "犯人のオドシに屈する。", kanji: "脅し", reading: "おどし" },
  { sentence: "一点をギョウシする。", kanji: "凝視", reading: "ぎょうし" },
  { sentence: "肩がコる。", kanji: "凝", reading: "こ" },
  { sentence: "食パンをゲンキンで買う。", kanji: "現金", reading: "げんきん" },
  { sentence: "キンキュウに連絡する。", kanji: "緊急", reading: "きんきゅう" },
  { sentence: "グレツな行為を非難する。", kanji: "愚劣", reading: "ぐれつ" },
  { sentence: "オロカナ考えと気付く。", kanji: "愚か", reading: "おろか" },
  { sentence: "グウセンの一致。", kanji: "偶然", reading: "ぐうぜん" },
  { sentence: "タイグウの改善を求める。", kanji: "待遇", reading: "たいぐう" },
  { sentence: "ケイバンを受ける。", kanji: "刑罰", reading: "けいばつ" },
  { sentence: "ケイヤクが成立する。", kanji: "契約", reading: "けいやく" },
  { sentence: "自己をケイハツする。", kanji: "啓発", reading: "けいはつ" },
  { sentence: "ケイジバンに張り出す。", kanji: "掲示板", reading: "けいじばん" },
  { sentence: "国旗をカカげる。", kanji: "掲", reading: "かか" },
  { sentence: "ケイタイ用のラジオ。", kanji: "携帯", reading: "けいたい" },
  { sentence: "建設工事にタズサわる。", kanji: "携", reading: "たずさ" },
  { sentence: "一時間のキュウケイ。", kanji: "休憩", reading: "きゅうけい" },
  { sentence: "市民のイコイの場所。", kanji: "憩い", reading: "いこい" },
  { sentence: "ヨウケイ場を見学する。", kanji: "養鶏", reading: "ようけい" },
  { sentence: "ニワトリを飼っている。", kanji: "鶏", reading: "にわとり" },
  { sentence: "日本のホゲイ船。", kanji: "捕鯨", reading: "ほげい" },
  { sentence: "クジラが潮を吹く。", kanji: "鯨", reading: "くじら" },
  { sentence: "生活費をケンヤクする。", kanji: "倹約", reading: "けんやく" },
  { sentence: "ケンメイな方法を探す。", kanji: "賢明", reading: "けんめい" },
  { sentence: "イルカはカシコイ動物だ。", kanji: "賢", reading: "かしこい" },
  { sentence: "ゲンカク症状が現れる。", kanji: "幻覚", reading: "げんかく" },
  { sentence: "マボロシが見える。", kanji: "幻", reading: "まぼろし" },
  { sentence: "コリツ無援となる。", kanji: "孤立", reading: "こりつ" },
  { sentence: "コを描いて飛ぶ。", kanji: "弧", reading: "こ" },
  { sentence: "コヨウ契約を結ぶ。", kanji: "雇用", reading: "こよう" },
  { sentence: "助手をヤトウ。", kanji: "雇", reading: "やとう" },
  { sentence: "クラブのコモンの先生。", kanji: "顧問", reading: "こもん" },
  { sentence: "幼児時代をカエリみる。", kanji: "顧", reading: "かえり" },
  { sentence: "ゴラク施設が増える。", kanji: "娯楽", reading: "ごらく" },
  { sentence: "カクゴを決める。", kanji: "覚悟", reading: "かくご" },
  { sentence: "自分の非をサトる。", kanji: "悟", reading: "さと" },
  { sentence: "葉のキコウが開閉する。", kanji: "気孔", reading: "きこう" },
  { sentence: "コウミョウな手口。", kanji: "巧妙", reading: "こうみょう" },
  { sentence: "タクミに操る。", kanji: "巧", reading: "たくみ" },
  { sentence: "手のコウに薬を塗る。", kanji: "甲", reading: "こう" },
  { sentence: "船のカンパン。", kanji: "甲板", reading: "かんぱん" },
  { sentence: "鉱山のハイコウ。", kanji: "廃坑", reading: "はいこう" },
  { sentence: "自由をコウソクする。", kanji: "拘束", reading: "こうそく" },
  { sentence: "コウガイを散歩する.", kanji: "郊外", reading: "こうがい" },
  { sentence: "手帳にヒカエル。", kanji: "控える", reading: "ひかえる" },
  { sentence: "突然の来客にアワテル。", kanji: "慌てる", reading: "あわてる" },
  { sentence: "キョウコウ手段を取る。", kanji: "強硬", reading: "きょうこう" },
  { sentence: "カタイ表現を言い換える。", kanji: "硬", reading: "かたい" },
  { sentence: "知恵をシボる。", kanji: "絞", reading: "しぼ" },
  { sentence: "自分で自分の首をシメル。", kanji: "締める", reading: "しめる" },
  { sentence: "研究ヨウコウを発表する。", kanji: "要綱", reading: "ようこう" },
  { sentence: "サーカスのツナワタリ。", kanji: "綱渡り", reading: "つなわたり" },
  { sentence: "牛乳をハッコウさせる。", kanji: "発酵", reading: "はっこう" },
  { sentence: "困難をコクフクする。", kanji: "克服", reading: "こくふく" },
];

const kanjiTest2WriteQuestions: Question[] = KANJI_TEST_2_ITEMS.map((item, index) =>
  Question.create({
    id: `q-japanese-kanji-test2-write-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-japanese-kanji-test2-write",
    prompt: item.sentence,
    answer: item.kanji,
  }),
);

const kanjiTest2ReadQuestions: Question[] = KANJI_TEST_2_ITEMS.map((item, index) =>
  Question.create({
    id: `q-japanese-kanji-test2-read-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-japanese-kanji-test2-read",
    prompt: item.kanji,
    answer: item.reading,
  }),
);

// 単語マスターI（Lesson 2 新出語彙、全99語）。4択クイズの誤答選択肢は、同じ単元内の
// 他の単語の訳をUI側で流用して自動生成する（専用のデータは持たない）。
// ユーザー提供のソース（L2単語.rtf、全104行）には53〜57番が48〜52番（sponge/a
// pair of ~/scissors/cut/cloth）と完全に重複していたため、重複5件を除いた99語を登録する。
const ENGLISH_VOCAB_1_ITEMS: { word: string; meaning: string }[] = [
  { word: "hold (動)", meaning: "手に持つ、抱く" },
  { word: "Happy birthday!", meaning: "誕生日おめでとう！" },
  { word: "hand + O + O", meaning: "(人)に(物)を手渡す" },
  { word: "What (a/an) + 形容詞 + 名", meaning: "なんて～な...なのだろう！" },
  { word: "so (= very) much", meaning: "とても" },
  { word: "take (動)", meaning: "受け取る、もらう" },
  { word: "kiss (動)", meaning: "キスする" },
  { word: "painting (名)", meaning: "絵画" },
  { word: "poster (名)", meaning: "ポスター" },
  { word: "frame (名)", meaning: "枠、額縁" },
  { word: "lovely (形)", meaning: "きれいな、すてきな" },
  { word: "perfect (形)", meaning: "完璧な、最適の" },
  { word: "Scrooge (名)", meaning: "スクルージ（人名）" },
  { word: "selfish (形)", meaning: "わがままな、利己的な" },
  { word: "neat (形)", meaning: "きちんとした" },
  { word: "sentence (名)", meaning: "文" },
  { word: "funny (形)", meaning: "おかしい、滑稽な" },
  { word: "sock(s) (名)", meaning: "靴下" },
  { word: "drive (動)", meaning: "運転する" },
  { word: "a little", meaning: "少し" },
  { word: "phone (名)", meaning: "電話（＝telephone）" },
  { word: "telephone (名)", meaning: "電話" },
  { word: "[for] + 時間", meaning: "～の間" },
  { word: "before SV (接)", meaning: "～する前に" },
  { word: "get + 形容詞", meaning: "～になる" },
  { word: "dark (形)", meaning: "暗い" },
  { word: "worried (形)", meaning: "心配して" },
  { word: "because SV (接)", meaning: "～だから、～なので" },
  { word: "late (形)", meaning: "遅い" },
  { word: "worry (動)", meaning: "心配する" },
  { word: "while SV (接)", meaning: "～する間に" },
  { word: "accident (名)", meaning: "事故" },
  { word: "have an accident", meaning: "事故にあう" },
  { word: "stop (動)", meaning: "やめる、中断する、中止させる" },
  { word: "when SV (接)", meaning: "～するときに" },
  { word: "shop [for ~] (動)", meaning: "（～を）買いにいく" },
  { word: "exam (名)", meaning: "試験" },
  { word: "ball (名)", meaning: "ベル、鐘" },
  { word: "ring (動)", meaning: "鳴る" },
  { word: "after SV (接)", meaning: "～した後に" },
  { word: "finish (動)", meaning: "終える" },
  { word: "rake (名)", meaning: "熊手" },
  { word: "clean up", meaning: "片づける" },
  { word: "yard (名)", meaning: "庭" },
  { word: "peel (動)", meaning: "皮をむく" },
  { word: "plastic (形)", meaning: "プラスチック製の" },
  { word: "hose (名)", meaning: "ホース" },
  { word: "sponge (名)", meaning: "スポンジ" },
  { word: "a pair of ~", meaning: "1対の～" },
  { word: "scissors (名)", meaning: "はさみ" },
  { word: "cut (動)", meaning: "切る" },
  { word: "cloth (名)", meaning: "布地" },
  { word: "software (名)", meaning: "コンピューターのソフト" },
  { word: "report (名)", meaning: "報告（書）、レポート" },
  { word: "guidebook (名)", meaning: "ガイドブック、手引き" },
  { word: "rather (副)", meaning: "かなり" },
  { word: "the Dutch (名)", meaning: "オランダ人" },
  { word: "start (動)", meaning: "始める（＝begin）" },
  { word: "colony (名)", meaning: "植民地" },
  { word: "Amsterdam (名)", meaning: "アムステルダム" },
  { word: "island (名)", meaning: "島" },
  { word: "Manhattan [Island] (名)", meaning: "マンハッタン（島）" },
  { word: "American(s) (名)", meaning: "アメリカ人" },
  { word: "Native American(s) (名)", meaning: "アメリカ先住民の" },
  { word: "buy + O + for ~", meaning: "～を（値段）で買う" },
  { word: "nothing (名)", meaning: "無、ゼロ" },
  { word: "Dutch (形)", meaning: "オランダの" },
  { word: "become + C (動)", meaning: "～になる" },
  { word: "important (形)", meaning: "重要な、大切な" },
  { word: "the English (名)", meaning: "イギリス人、イングランド人" },
  { word: "York (名)", meaning: "ヨーク（英国の古都）" },
  { word: "strange (形)", meaning: "奇妙な、不思議な" },
  { word: "western (形)", meaning: "西の、西方の" },
  { word: "eastern (形)", meaning: "東の、東方の" },
  { word: "Central America (名)", meaning: "中央アメリカ" },
  { word: "taste (名)", meaning: "味" },
  { word: "celebrate (動)", meaning: "祝う" },
  { word: "get ready to-v", meaning: "～する用意をする" },
  { word: "vanilla (名)", meaning: "バニラ" },
  { word: "if SV (接)", meaning: "もし～ならば" },
  { word: "promise to-v", meaning: "～する約束をする" },
  { word: "promise (名)", meaning: "約束" },
  { word: "keep a promise", meaning: "約束を守る" },
  { word: "rain (名)", meaning: "雨" },
  { word: "be able to-v", meaning: "～することができる" },
  { word: "beach (名)", meaning: "砂浜、海岸" },
  { word: "go to the beach", meaning: "海辺へ行く" },
  { word: "cloudy (形)", meaning: "曇った" },
  { word: "Mt. (= Mount) (名)", meaning: "～山" },
  { word: "Christopher Columbus (名)", meaning: "クリストファー・コロンブス" },
  { word: "sail (動)", meaning: "航海する" },
  { word: "Italian (名)", meaning: "イタリア（人）の" },
  { word: "sailor (名)", meaning: "船乗り" },
  { word: "dream (名)", meaning: "夢" },
  { word: "have a dream", meaning: "夢を見る、夢を抱く" },
  { word: "the earth (名)", meaning: "地球" },
  { word: "huge (形)", meaning: "巨大な" },
  { word: "east (形)", meaning: "（形）（副）東の/に" },
  { word: "west (形)", meaning: "（形）（副）西の/に" },
];

const englishVocab1Questions: Question[] = ENGLISH_VOCAB_1_ITEMS.map((item, index) =>
  Question.create({
    id: `q-english-vocab1-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-english-vocab-1",
    prompt: item.word,
    answer: item.meaning,
  }),
);

// Lesson 2 Scene 1の例文練習（教科書右ページ「例文練習」3問）。answerは
// 単語の並べ替え問題のお手本順序として使う（UI側でトークンに分割しシャッフルする）。
const LESSON2_SCENE1_PRACTICE_ITEMS: { prompt: string; answer: string }[] = [
  { prompt: "サラはなんて静かな赤ちゃんなのでしょう。", answer: "What a quiet baby Sarah is!" },
  {
    prompt: "スクルージさんはなんてわがままな男だったのでしょう。",
    answer: "What a selfish man Mr. Scrooge was!",
  },
  { prompt: "(これらは) なんてかっこいいジーンズなのでしょう。", answer: "What neat jeans these are!" },
];

const lesson2Scene1PracticeQuestions: Question[] = LESSON2_SCENE1_PRACTICE_ITEMS.map((item, index) =>
  Question.create({
    id: `q-english-l2-s1-practice-${String(index + 1).padStart(2, "0")}`,
    learningUnitId: "unit-english-l2-s1-practice",
    prompt: item.prompt,
    answer: item.answer,
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
  // チャート式 体系数学2 代数編 例題100「樹形図の利用」（第6章 1: 場合の数）。
  Question.create({
    id: "q-math-word-3",
    learningUnitId: "unit-math-word-1",
    prompt:
      "3けたの自然数のうち、各けたの数の和が6であるものは何個あるか答えなさい。ただし、各けたの数は自然数（1以上の整数）とする。",
    answer: "10個",
    explanation: [
      "数を数え上げるときは、もれなく、重複なく数えるために樹形図を利用します。各けたの数は自然数なので、百、十、一の位はすべて1以上です。",
      "1. 百の位の数を固定する: 百の位を小さい順(1, 2, 3, 4)に考えます。",
      "2. 十の位の数を小さい順に並べる: 百の位を決めたら、十の位を1から順に大きくしていきます。",
      "3. 一の位を計算する: 一の位は 6－(百の位)－(十の位) で自動的に決まります。",
      "※ 百の位が5以上になることはありません(5にすると、十と一の位の最小の和 1+1=2 を足して7以上になるため)。",
    ].join("\n"),
  }),
  ...kanjiTest1WriteQuestions,
  ...kanjiTest1ReadQuestions,
  ...kanjiTest2WriteQuestions,
  ...kanjiTest2ReadQuestions,
  ...englishVocab1Questions,
  ...lesson2Scene1PracticeQuestions,
  ...preSocialQuestions,
];
