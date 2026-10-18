import { Curriculum } from "../../domain/models/Curriculum";
import type { ExamType } from "../../domain/models/ExamType";
import { LearningUnit } from "../../domain/models/LearningUnit";
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
