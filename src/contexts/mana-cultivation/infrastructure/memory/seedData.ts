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
  LearningUnit.create({ id: "unit-english-1", curriculumId: "curriculum-english", title: "不定詞", difficulty: 2 }, "English"),
  LearningUnit.create({ id: "unit-english-2", curriculumId: "curriculum-english", title: "動名詞", difficulty: 2 }, "English"),
  LearningUnit.create(
    {
      id: "unit-english-vocab-1",
      curriculumId: "curriculum-english",
      title: "不定詞 単語テスト",
      difficulty: 2,
      questionType: "VocabularyTest",
    },
    "English",
  ),
  LearningUnit.create(
    {
      id: "unit-english-translate-ja-1",
      curriculumId: "curriculum-english",
      title: "本文の和訳 (不定詞)",
      difficulty: 3,
      questionType: "PassageTranslationToJapanese",
    },
    "English",
  ),
  LearningUnit.create(
    {
      id: "unit-english-translate-en-1",
      curriculumId: "curriculum-english",
      title: "英訳問題 (不定詞)",
      difficulty: 3,
      questionType: "PassageTranslationToEnglish",
    },
    "English",
  ),
  LearningUnit.create({ id: "unit-math-1", curriculumId: "curriculum-math", title: "一次関数", difficulty: 3 }, "Math"),
  LearningUnit.create({ id: "unit-math-2", curriculumId: "curriculum-math", title: "連立方程式", difficulty: 3 }, "Math"),
  LearningUnit.create(
    { id: "unit-japanese-1", curriculumId: "curriculum-japanese", title: "漢字・語彙", difficulty: 1 },
    "Japanese",
  ),
  LearningUnit.create(
    { id: "unit-science-1", curriculumId: "curriculum-science", title: "化学変化", difficulty: 3 },
    "Science",
  ),
  LearningUnit.create(
    { id: "unit-social-1", curriculumId: "curriculum-social", title: "歴史・近代日本", difficulty: 2 },
    "SocialStudies",
  ),
];

export const upcomingExams: UpcomingExam[] = [
  new UpcomingExam("exam-2nd-midterm", DEMO_EXAM_TYPE, new Date("2026-11-15"), [
    "unit-english-1",
    "unit-english-vocab-1",
    "unit-english-translate-ja-1",
    "unit-english-translate-en-1",
    "unit-math-1",
    "unit-math-2",
    "unit-science-1",
    "unit-social-1",
  ]),
];
