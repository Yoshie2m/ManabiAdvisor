# 戦術的仕様: 魔力修練コンテキスト (Mana Cultivation Context)

用語定義は `../glossary.md` の「2. 魔力修練コンテキスト」を参照。本ドキュメントは既存実装 (`src/contexts/mana-cultivation/`) を仕様として明文化したものである。

## 現在の実装範囲

モデル化されているのは次の5つ:
1. 「どの学年・試験種別がどの出題範囲・難易度構成を持つか」という**カリキュラムの構造**（`CLAUDE.md` の学習コンテンツ配置方針に対応）。
2. 「主要5科目の学習（学習ユニットの完了）によって、生徒の科目別能力が成長する」という**能力成長ルール**（ユーザーヒアリング済み、下記「意思決定の経緯（第1回）」参照）。
3. 「過去の間違い問題から単元理解度を算出し、次のテスト範囲からデイリーミッションを生成する。また次テスト範囲の予想問題ミッションを選択できる」という**ミッション生成ルール**（ユーザーヒアリング済み、下記「意思決定の経緯（第2回）」参照）。
4. 「中1〜高3を貫く7段階の学年進行（Grade）のうち、プレ期間（小6）とセカンドグレード（中2）を選択できる」という**学年段階モデル**（ユーザーヒアリング済み、下記「意思決定の経緯（第3回）」参照）。
5. 「英語に単語テスト・本文の和訳・英訳問題という出題形式を追加する」という**出題形式モデル**（本追記分。ユーザーヒアリング済み、下記「意思決定の経緯（第4回）」参照）。

項目1〜4はドメイン層に加え、動作確認用のユースケース層・インメモリインフラ層・UIまで実装済み（`tasklist.md` 参照）。項目5（本追記）もドメイン層・インメモリシードデータ・UIまで実装済み。

## 意思決定の経緯（第1回ヒアリング: 能力成長ルール）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **科目とExamTypeの対応**: 一般的な日本の学校区分に準拠する。`JuniorHigh2ndYearRegularExam`＝5科目全部、`Eiken`＝`English`のみ、`Elementary6thYearEntranceExam`＝`English`を除く4科目。
2. **能力値の粒度**: 科目ごとに独立した値（`SubjectAbility`）を持つ。5科目合算の単一値にはしない。
3. **学舎割当コンテキストとの関係**: 学舎割当コンテキストの `ManaQuality`（秩序度・混沌度・魔力量）とは**別概念**として、魔力修練コンテキスト独自に新設する。`StudentAggregate` は変更しない。
4. **成長トリガーと上昇量**: `LearningUnit` を1つ完了するごとに、対応科目の能力値が固定量（`LEARNING_UNIT_COMPLETION_GAIN = 5`。要調整可能な定数）上昇する。上限は `ManaQuality` と同じ 0〜100。
5. **重複完了の扱い**: 同一 `LearningUnit` を何度完了しても、その都度上昇する（上限100でクランプ）。完了済みIDの重複排除は行わない。

## 意思決定の経緯（第2回ヒアリング: ミッション生成ルール）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **単元理解度の算出方法**: 正答率（正解数／試行数）をそのまま使う。未試行の単元は `rate = 0` として扱う（＝最も優先度が高い＝最も「苦手」とみなす）。
2. **「次のテスト」のモデル化範囲**: 今回 `UpcomingExam` エンティティとして設計する。生徒個人の持ち物ではなく、`ExamType` 単位で共有される情報（同じ試験を受ける生徒全員に共通）とする。
3. **デイリーミッションの粒度**: 1日に1つ、出題範囲の中で理解度が最も低い1単元を「おすすめ単元」として提示する。
4. **ミッションの型**: 「デイリーミッション」と「次テスト範囲の予想問題ミッション」は、共通の `Mission` 型に `type`（`"Daily"` / `"MockExam"`）を持たせて区別する。
5. **正誤記録と能力成長の関係**: 「間違えた問題の記録（`recordAttempt`）」と「学習ユニット完了による能力成長（`completeLearningUnit`）」は別々の操作として扱う（1回の学習セッションで両方呼ばれうるが、ドメインメソッドとしては分離する）。
6. **集約境界**: `UnderstandingLevel` と `Mission` は、既存の `CultivationProgress` 集約（`SubjectAbility` を保持）に含める。1生徒の修練状態を1つの集約にまとめ、関連する状態変更を一貫して扱う。

## 意思決定の経緯（第3回ヒアリング: 学年段階モデル）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **学舎割当ロジックへの影響**: `Grade`（学年段階）は学舎割当ロジックには影響しない（※この時点では `ManaQuality` による自動判定だったが、後の鑑定UX変更により `house-assignment.md` 参照の通り生徒自身の選択制に変更された。`Grade` が学舎割当に影響しないという結論自体は変わらない）。`Grade` は魔力修練コンテキストで「どのExamType/カリキュラムを使うか」を決めるための情報としてのみ扱う。

## 意思決定の経緯（第4回ヒアリング: 出題形式モデル）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **位置づけ**: 単語テスト・本文の和訳・英訳問題は、既存の文法単元（例:「不定詞」）に紐づく「出題形式のバリエーション」としてではなく、単元とは独立した別概念として扱う。具体的には、`QuestionType` を持つ専用の `LearningUnit`（例:「不定詞 単語テスト」）として、文法単元とは別のレコードで表現する。
2. **汎用性**: `QuestionType` の仕組みは英語専用に割り切らず、全科目で共通して使える汎用的な値オブジェクトとして設計する。ただし現時点では英語向けの3形式のみ定義し、他科目向けの形式は未定義のまま（`SubjectQuestionTypePolicy` の対応表が空の科目は、どの `QuestionType` も使えない）。
3. **成長・記録ロジックへの影響**: 出題形式ごとに別の成長・記録ロジックは設けない。既存の `completeLearningUnit`（能力成長）・`recordAttempt`（正誤記録）の仕組みをそのまま使う。`QuestionType` は「この学習ユニットがどんな出題形式か」という構造情報としてのみ追加する。
2. **GradeとExamTypeの対応関係**: 1つの `Grade` に対して対応する「定期テスト系」`ExamType` が1つ存在し（`Pre`→`Elementary6thYearEntranceExam`、`Second`→`JuniorHigh2ndYearRegularExam`）、`Eiken` は学年を問わず全 `Grade` 共通で受けられる。
3. **Grade型の範囲**: 今回選択肢にするのは `Pre` と `Second` の2つだが、`Grade` 型自体は将来の5学年分（`First`/`Third`/`Fourth`/`Fifth`/`Sixth`）も含めて7値すべてを先に定義する。対応する `ExamType`/カリキュラムがまだ無い学年は、UIでは選択肢に出さないだけに留める。
4. **大学受験の扱い**: 今回はモデル化しない。「シックスグレード（高3）の先にあるゴール」という位置づけのみドキュメントに残し、型や`ExamType`としては追加しない。

## 意思決定の経緯（第5回ヒアリング: 難易度の値域・能力成長量との連動）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **値域・意味**: `LearningUnit.difficulty` は1〜5の整数レベル（1が最も易しく、5が最も難しい）とする。`Difficulty` 値オブジェクト（`DIFFICULTIES` 定数・`isDifficulty`）として表現し、範囲外の値は `LearningUnit.create()` 時に例外を投げる。
2. **能力成長量との連動**: 連動させない。`CultivationProgress.completeLearningUnit()` の上昇量は引き続き固定値（`LEARNING_UNIT_COMPLETION_GAIN = 5`）のまま変更しない。`difficulty` は表示用の指標として独立させる。
3. **UI表示**: 修練場の学習ユニット一覧に難易度を表示する（`GetCultivationOverview` の `LearningUnitView` に `difficulty` を追加）。

## 意思決定の経緯（第6回ヒアリング: 数学のQuestionType追加）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **対象科目**: 今回は `Math` のみ。`Japanese`/`Science`/`SocialStudies` は引き続き対応表を追加しない（スコープ外のまま）。
2. **追加するQuestionType**: `Calculation`（計算問題）・`WordProblem`（文章題）の2種類。`QUESTION_TYPES_BY_SUBJECT.Math` に追加。
3. **seedデータ**: 既存の数学カリキュラム（第1章 式の計算／第6章 確率と標本調査）に、それぞれの出題形式を持つ学習ユニットを1件ずつ追加する（`unit-math-calc-1` / `unit-math-word-1`）。

## 意思決定の経緯（第7回ヒアリング: コンテンツ本体の設計・投入）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **格納場所**: `LearningUnit`（構造）とは分離し、新しいFirestoreコレクション `questions/{questionId}` に格納する（`CLAUDE.md` の構造とコンテンツ本体の分離方針に従う）。
2. **ドメインモデル**: `Question` エンティティ（`{ id, learningUnitId, prompt, answer }`）を新設する。`prompt`/`answer` が空文字なら生成時に例外を投げる。1つの `LearningUnit` に対し0件以上の `Question` が属する（単語テスト・計算問題は複数件、本文の和訳/英訳のような1件だけのユニットもあり得る）。
3. **実データ**: 今回は例として数件作成する。対象は現在 `questionType` を持つ唯一のユニット群（数学の `unit-math-calc-1` / `unit-math-word-1`）。第1章「式の計算」の計算問題3件、第6章「確率と標本調査」の文章題2件を作成した。英語の単語テスト・和訳・英訳問題は、対応するLearningUnitが現状存在しないため今回は対象外（将来追加する場合は同じ`Question`の仕組みで対応できる）。

### Question（エンティティ）

```ts
type QuestionProps = { id: string; learningUnitId: string; prompt: string; answer: string };

class Question {
  static create(props: QuestionProps): Question; // prompt/answerが空文字なら例外
  static reconstruct(props: QuestionProps): Question; // 永続化データを信頼し、再検証しない
  readonly id: string;
  readonly learningUnitId: string;
  readonly prompt: string;
  readonly answer: string;
}
```

### QuestionRepository（インターフェース）

```ts
interface QuestionRepository {
  findByLearningUnitId(learningUnitId: string): Promise<Question[]>;
}
```

具象実装 `FirebaseQuestionRepository`（`infrastructure/firebase/`）。Firestoreの `questions/{questionId}` コレクションに `{ learningUnitId, prompt, answer }` の形で永続化する。読み取りのみで、クライアントからの書き込みは禁止（セキュリティルール）。

### GetQuestionsForLearningUnit（ユースケース）

```ts
class GetQuestionsForLearningUnit {
  constructor(questionRepository: QuestionRepository);
  execute(learningUnitId: string): Promise<Question[]>;
}
```

`src/app/academy/page.tsx` の学習ユニット一覧で、`questionType` を持つユニットに「問題を見る」ボタンを表示し、クリック時にこのユースケースを呼んで問題文・正解を表示する。

## 値オブジェクト

### ExamType

```ts
const EXAM_TYPES = [
  "JuniorHigh2ndYearRegularExam", // 中学2年生の定期テスト対策
  "Eiken",                         // 英検対策
  "Elementary6thYearEntranceExam", // 小学6年生の中学受験対策
] as const;
type ExamType = (typeof EXAM_TYPES)[number];
```

- **不変条件**: 上記3値のいずれかのみ。新しい学年・試験種別を増やす場合は、新コンテキストを作るのではなくこの配列に追加する方針（`CLAUDE.md` 参照）。

### Grade（新規）

```ts
const GRADES = ["Pre", "First", "Second", "Third", "Fourth", "Fifth", "Sixth"] as const;
type Grade = (typeof GRADES)[number];
function isGrade(value: string): value is Grade;
```

- **不変条件**: 上記7値のいずれかのみ。
- `Pre`=プレ期間(小6)、`First`=ファーストグレード(中1)、`Second`=セカンドグレード(中2)、`Third`=サードグレード(中3)、`Fourth`=フォースグレード(高1)、`Fifth`=フィフスグレード(高2)、`Sixth`=シックスグレード(高3)。
- 現時点で対応する `ExamType`/カリキュラムが存在するのは `Pre` と `Second` のみ（`LAUNCHED_GRADES`、下記 `GradeExamTypePolicy` 参照）。残り5学年は型としては定義済みだが、中身は未着手。

### Subject（新規）

```ts
const SUBJECTS = ["English", "Math", "Japanese", "Science", "SocialStudies"] as const;
type Subject = (typeof SUBJECTS)[number];
function isSubject(value: string): value is Subject;
```

- **不変条件**: 上記5値のいずれかのみ。

### SubjectAbility（新規）

```ts
class SubjectAbility {
  static initial(subject: Subject): SubjectAbility; // level = 0 で生成
  static create(subject: Subject, level: number): SubjectAbility; // level範囲外なら例外
  readonly subject: Subject;
  readonly level: number; // 0〜100
  increase(amount: number): SubjectAbility; // amount <= 0 なら例外。新しいSubjectAbilityを返す（不変）
}
```

- **不変条件**: `level` は常に 0〜100（生成時・`increase`後とも）。`increase` は `Math.min(100, level + amount)` でクランプし、上限を超えない。
- `increase` の `amount` は正の数でなければならない（0以下は例外）。

### UnderstandingLevel（新規）

```ts
class UnderstandingLevel {
  static zero(learningUnitId: string): UnderstandingLevel; // correctCount=0, totalCount=0
  static create(learningUnitId: string, correctCount: number, totalCount: number): UnderstandingLevel;
  readonly learningUnitId: string;
  readonly correctCount: number;
  readonly totalCount: number;
  get rate(): number; // 0〜100。totalCount===0のとき0
  recordAttempt(isCorrect: boolean): UnderstandingLevel; // totalCount+1、isCorrectならcorrectCount+1 した新しいインスタンスを返す
}
```

- **不変条件**: `0 <= correctCount <= totalCount`。`rate` は `totalCount === 0` のとき `0`、それ以外は `Math.round((correctCount / totalCount) * 100)`。
- `create` は `correctCount > totalCount` または両者が負数のとき例外を投げる。

### QuestionType（新規）

```ts
const QUESTION_TYPES = [
  "VocabularyTest",               // 単語テスト
  "PassageTranslationToJapanese", // 本文の和訳
  "PassageTranslationToEnglish",  // 英訳問題
] as const;
type QuestionType = (typeof QUESTION_TYPES)[number];
function isQuestionType(value: string): value is QuestionType;
```

- **不変条件**: 上記3値のいずれかのみ。
- 全科目共通で使える値オブジェクトとして設計するが、現時点では英語向けの3値のみ定義。他科目向けの形式を追加する場合はこの配列に追加する（`CLAUDE.md` のExamType/Subjectと同様の拡張方針）。

## エンティティ

### Curriculum（更新）

```ts
class Curriculum {
  static create(params: {
    id: string;
    examType: ExamType;
    subject: Subject;
    title: string;
  }): Curriculum; // examType × subject が CurriculumSubjectSpecification を満たさなければ例外
  readonly id: string;
  readonly examType: ExamType;
  readonly subject: Subject; // 追加フィールド
  readonly title: string;
}
```

- **破壊的変更**: コンストラクタを `private` にし、`Curriculum.create(...)` 経由の生成に変更。引数も位置引数（`id, examType, title`）からオブジェクト引数（`{ id, examType, subject, title }`）に変更する。現状このクラスを外部から直接 `new` している箇所はない（`CurriculumRepository` はインターフェースのみ）ため、影響範囲はこのファイル自身のみ。
- **不変条件**: `examType` と `subject` の組み合わせは、必ず `CurriculumSubjectSpecification` を満たす（下記）。満たさない場合は生成時に例外。
- **識別子**: `id`。
- 1つの `ExamType` に対して複数の `Curriculum` が存在しうる（`CurriculumRepository.findByExamType` が配列を返すため）。

### LearningUnit（更新）

```ts
class LearningUnit {
  static create(
    params: {
      id: string;
      curriculumId: string;
      title: string;
      difficulty: number;
      questionType?: QuestionType; // 省略可。指定する場合は SubjectQuestionTypePolicy を満たす必要がある
    },
    subject: Subject,
  ): LearningUnit;
  readonly id: string;
  readonly curriculumId: string;
  readonly title: string;
  readonly difficulty: number;
  readonly questionType: QuestionType | null; // 追加フィールド
}
```

- **破壊的変更**: コンストラクタを `private` にし、`LearningUnit.create(props, subject)` 経由の生成に変更（`Curriculum` と同様の形）。`subject` は `questionType` のバリデーションにのみ使い、保持はしない（`subject` は `curriculumId` 経由で `Curriculum` から辿れるため、フィールドとしては重複させない）。
- **識別子**: `id`。
- `curriculumId` で所属する `Curriculum` を参照する（弱参照。現状、存在検証はドメイン層にない）。
- **不変条件**: `questionType` を指定する場合、`subject` と `questionType` の組み合わせは `SubjectQuestionTypePolicy` を満たさなければならない（下記）。満たさない場合は生成時に例外。`questionType` を省略した場合はバリデーションなしで `null` になる（既存の文法単元向けの後方互換）。
- 「不定詞」のような文法単元は `questionType = null` のまま。「単語テスト」「本文の和訳」「英訳問題」は、それぞれ `questionType` を持つ独立した `LearningUnit`（例: 同じ `curriculumId` に属するが別の `id` を持つレコード）として表現する。1つの `LearningUnit` が複数の `questionType` を持つことはない。
- `difficulty`（難易度）の値域・単位は現行コードでは未規定。本追記のスコープ外（下記「スコープ外（残課題）」参照）。

### UpcomingExam（新規）

```ts
class UpcomingExam {
  constructor(
    readonly id: string,
    readonly examType: ExamType,
    readonly scheduledDate: Date,
    readonly targetLearningUnitIds: readonly string[], // 出題範囲
  );
}
```

- **識別子**: `id`。
- **不変条件**: `targetLearningUnitIds` は空配列であってはならない（生成時に例外）。
- 生徒個人には属さず、`ExamType` 単位で共有される（同じ試験を受ける生徒全員に対し同一の `UpcomingExam` を参照する想定）。

### Mission（新規）

```ts
type MissionType = "Daily" | "MockExam";

class Mission {
  static assignDaily(id: string, assignedDate: Date, focusLearningUnitId: string): Mission;
  static offerMockExam(id: string, upcomingExam: UpcomingExam): Mission;
  readonly id: string;
  readonly type: MissionType;
  readonly targetLearningUnitIds: readonly string[];
}
```

- **識別子**: `id`。
- **不変条件**: `type === "Daily"` のとき `targetLearningUnitIds.length === 1`。`type === "MockExam"` のとき `targetLearningUnitIds` は `upcomingExam.targetLearningUnitIds` と同一（1件以上）。
- 完了状態（やった／やっていない）のトラッキングは本追記のスコープ外（下記「スコープ外（残課題）」参照）。`Mission` は「何を提示するか」のみを表す。

## 仕様 (Specification)

### CurriculumSubjectSpecification（新規）

```ts
interface CurriculumSubjectSpecification {
  isSatisfiedBy(examType: ExamType, subject: Subject): boolean;
}

const SUBJECTS_BY_EXAM_TYPE: Record<ExamType, readonly Subject[]> = {
  JuniorHigh2ndYearRegularExam: ["English", "Math", "Japanese", "Science", "SocialStudies"],
  Eiken: ["English"],
  Elementary6thYearEntranceExam: ["Japanese", "Math", "Science", "SocialStudies"],
};

const curriculumSubjectSpecification: CurriculumSubjectSpecification = {
  isSatisfiedBy: (examType, subject) => SUBJECTS_BY_EXAM_TYPE[examType].includes(subject),
};
```

- `Curriculum.create` がこの仕様を使って `examType` × `subject` の妥当性を検証する。

### FocusUnitSelectionPolicy（新規）

```ts
interface FocusUnitSelectionPolicy {
  selectFocusUnit(
    targetLearningUnitIds: readonly string[],
    understandingLevels: readonly UnderstandingLevel[],
  ): string; // 最も rate が低い learningUnitId を返す
}

const lowestUnderstandingRateFirstPolicy: FocusUnitSelectionPolicy = {
  selectFocusUnit: (targetLearningUnitIds, understandingLevels) => {
    const rateOf = (id: string) =>
      understandingLevels.find((u) => u.learningUnitId === id)?.rate ?? 0;
    return [...targetLearningUnitIds].sort((a, b) => rateOf(a) - rateOf(b))[0];
  },
};
```

- `targetLearningUnitIds` が空配列のときは例外を投げる（防御的チェック。`UpcomingExam` の不変条件により通常は発生しない）。
- 理解度が未記録の単元（`UnderstandingLevel` が存在しない）は `rate = 0` として扱われ、優先的に選ばれる。
- 同率の場合は `targetLearningUnitIds` の並び順で先頭のものを採用する（決定的な挙動とするための単純なタイブレーク）。

### GradeExamTypePolicy（新規）

```ts
interface GradeExamTypePolicy {
  availableExamTypesFor(grade: Grade): readonly ExamType[];
}

const REGULAR_EXAM_TYPE_BY_GRADE: Partial<Record<Grade, ExamType>> = {
  Pre: "Elementary6thYearEntranceExam",
  Second: "JuniorHigh2ndYearRegularExam",
};

const LAUNCHED_GRADES: readonly Grade[] = Object.keys(REGULAR_EXAM_TYPE_BY_GRADE) as Grade[];

const gradeExamTypePolicy: GradeExamTypePolicy = {
  availableExamTypesFor: (grade) => {
    const regularExamType = REGULAR_EXAM_TYPE_BY_GRADE[grade];
    return regularExamType ? [regularExamType, "Eiken"] : ["Eiken"];
  },
};
```

- `availableExamTypesFor` は、対応する定期テスト系 `ExamType` がある学年では `[定期テスト系ExamType, "Eiken"]`（定期テスト系が先頭）を、まだ無い学年（`First`/`Third`/`Fourth`/`Fifth`/`Sixth`）では `["Eiken"]` のみを返す。
- `LAUNCHED_GRADES` は `REGULAR_EXAM_TYPE_BY_GRADE` に定義済みの学年一覧であり、UI（鑑定画面）の選択肢をこの定数から生成する。新しい学年を開放する際は `REGULAR_EXAM_TYPE_BY_GRADE` に1行追加するだけでよい。

### SubjectQuestionTypePolicy（新規）

```ts
interface SubjectQuestionTypePolicy {
  isSatisfiedBy(subject: Subject, questionType: QuestionType): boolean;
}

const QUESTION_TYPES_BY_SUBJECT: Partial<Record<Subject, readonly QuestionType[]>> = {
  English: ["VocabularyTest", "PassageTranslationToJapanese", "PassageTranslationToEnglish"],
};

const subjectQuestionTypePolicy: SubjectQuestionTypePolicy = {
  isSatisfiedBy: (subject, questionType) =>
    (QUESTION_TYPES_BY_SUBJECT[subject] ?? []).includes(questionType),
};
```

- `LearningUnit.create` が `questionType` を指定された場合にこの仕様を使って `subject` との妥当性を検証する。
- `QUESTION_TYPES_BY_SUBJECT` に対応表が無い科目（English以外）は、どの `QuestionType` も許可しない（空配列）。将来他科目に出題形式を追加する場合はここに対応表を足す。

## 集約ルート

### CultivationProgress（更新）

```ts
const LEARNING_UNIT_COMPLETION_GAIN = 5;

class CultivationProgress {
  static initiate(studentId: StudentId, grade: Grade): CultivationProgress; // 5科目すべてをlevel=0で初期化
  readonly studentId: StudentId; // 学舎割当コンテキストの StudentId を再利用（下記「設計判断」参照）
  readonly grade: Grade; // 第3回ヒアリング分で追加。initiate時に確定し、以後変更する操作はまだ無い

  // 能力成長（第1回ヒアリング分、変更なし）
  getAbility(subject: Subject): SubjectAbility;
  completeLearningUnit(curriculum: Curriculum, learningUnit: LearningUnit): SubjectAbility;

  // ミッション生成（新規）
  getUnderstanding(learningUnitId: string): UnderstandingLevel; // 未記録なら UnderstandingLevel.zero(learningUnitId)
  recordAttempt(learningUnitId: string, isCorrect: boolean): UnderstandingLevel;
  getCurrentDailyMission(): Mission | null;
  assignDailyMission(
    upcomingExam: UpcomingExam,
    missionId: string,
    assignedDate: Date,
    policy?: FocusUnitSelectionPolicy, // 省略時は lowestUnderstandingRateFirstPolicy
  ): Mission;
  getMockExamMission(): Mission | null;
  offerMockExamMission(upcomingExam: UpcomingExam, missionId: string): Mission;
}
```

- **不変条件（能力成長・第1回ヒアリング分、変更なし）**:
  1. `initiate` された `CultivationProgress` は、`SUBJECTS` の全科目分の `SubjectAbility`（初期値 `level = 0`）を必ず保持する。欠落する科目はない。
  2. `completeLearningUnit(curriculum, learningUnit)` は、`learningUnit.curriculumId !== curriculum.id` の場合（＝渡された学習ユニットが渡されたカリキュラムに属さない）は例外を投げ、状態を変更しない。
  3. `completeLearningUnit` が成功した場合、`curriculum.subject` に対応する `SubjectAbility` のみが `LEARNING_UNIT_COMPLETION_GAIN` 分上昇する。他の科目の `SubjectAbility` は変化しない。
  4. 同一の `LearningUnit` を繰り返し完了しても、その都度 3. のルールに従って上昇する（上限100まで）。
- **不変条件（ミッション生成・新規）**:
  5. `recordAttempt(learningUnitId, isCorrect)` は、該当 `learningUnitId` の `UnderstandingLevel` のみを更新する。他の単元の `UnderstandingLevel` は変化しない。`completeLearningUnit` の状態（`SubjectAbility`）には影響しない。
  6. `assignDailyMission` は、`upcomingExam.targetLearningUnitIds` と現在保持している `UnderstandingLevel` 群を `FocusUnitSelectionPolicy` に渡し、選ばれた1単元を対象とする `type="Daily"` の `Mission` を生成し、「現在のデイリーミッション」として保持する（`getCurrentDailyMission()` で取得可能）。同じ日に再度呼び出した場合は上書きする（重複生成の禁止は行わない）。
  7. `offerMockExamMission` は、`upcomingExam.targetLearningUnitIds` 全件を対象とする `type="MockExam"` の `Mission` を生成し、「現在のモック模試ミッション」として保持する（`getMockExamMission()` で取得可能）。
  8. `Mission.targetLearningUnitIds` は `Mission` 自身の不変条件（上記）を常に満たす。
- **集約境界**: 生徒1人につき1つの `CultivationProgress`（科目別能力・単元理解度・現在のミッション一式）がこの境界内で保護される。外部から個別の `SubjectAbility` / `UnderstandingLevel` / `Mission` を直接書き換える手段は提供しない。

- **設計判断（要レビュー）**:
  1. `CultivationProgress.studentId` は学舎割当コンテキストの `StudentId`（`../house-assignment/domain/models/StudentId.ts`）をそのまま再利用する。`StudentId` は外部依存のない値オブジェクトであり、識別子の共有はコンテキスト間データ漏洩（ビジネスロジックの漏洩）には当たらないと判断したが、厳密なコンテキスト分離を優先する場合は魔力修練コンテキスト独自のID型に分離することも可能。
  2. デイリーミッション・モック模試ミッションとも、「同じ日・同じ試験に対して2回目の生成を拒否する」といった一意性の強制は行わない（呼び出すたびに最新の1件で上書きされる、単純な設計）。完了状態の管理（やった／やっていない）も今回は持たせない。これらが必要であれば別途仕様化する。
  いずれも問題があれば指摘してほしい。

## リポジトリ

### CurriculumRepository（インターフェース、変更なし）

```ts
interface CurriculumRepository {
  findByExamType(examType: ExamType): Promise<Curriculum[]>;
}
```

- 具象実装 `FirebaseCurriculumRepository`（`infrastructure/firebase/`）は実装済み。Firestoreの `curricula/{curriculumId}` コレクションに `{ examType, subject, title }` の形で永続化する（詳細は `tasklist.md` 7番参照）。
- `LearningUnit` を取得するリポジトリ（`LearningUnitRepository`）は後続の動作確認用システム構築時に追加済み（`domain/repositories/LearningUnitRepository.ts`）。具象実装 `FirebaseLearningUnitRepository` は、Firestoreの `learningUnits/{learningUnitId}` コレクションに `{ curriculumId, title, difficulty, questionType }` の形で永続化する。復元時は `Curriculum.reconstruct` / `LearningUnit.reconstruct` を使い、`CurriculumSubjectSpecification` / `SubjectQuestionTypePolicy` のバリデーションを再実行しない（永続化データは既に確定済みの不変条件を満たしている前提）。

## テスト不変条件チェックリスト（フェーズ3で実装）

- [ ] `Subject` の妥当な値（5種）・`isSubject` の真偽判定
- [ ] `SubjectAbility.create` は `level` が範囲外（負数・100超）のとき例外を投げる
- [ ] `SubjectAbility.initial` は `level = 0` で生成される
- [ ] `SubjectAbility.increase` は `level` を加算した新しいインスタンスを返し、元のインスタンスは変化しない（不変性）
- [ ] `SubjectAbility.increase` は上限100でクランプされる（例: level=98 に amount=5 で level=100 になる）
- [ ] `SubjectAbility.increase` は `amount <= 0` のとき例外を投げる
- [ ] `CurriculumSubjectSpecification`: `JuniorHigh2ndYearRegularExam` は5科目すべてでtrue
- [ ] `CurriculumSubjectSpecification`: `Eiken` は `English` のみtrue、他の4科目はfalse
- [ ] `CurriculumSubjectSpecification`: `Elementary6thYearEntranceExam` は `English` のみfalse、他の4科目はtrue
- [ ] `Curriculum.create` は `CurriculumSubjectSpecification` を満たさない組み合わせ（例: `Eiken` × `Science`）で例外を投げる
- [ ] `Curriculum.create` は妥当な組み合わせで正常に生成できる
- [ ] `CultivationProgress.initiate` は5科目すべてについて `level = 0` の `SubjectAbility` を持つ
- [ ] `CultivationProgress.completeLearningUnit` は対応する `Curriculum.subject` の `SubjectAbility` のみを `LEARNING_UNIT_COMPLETION_GAIN` 分上昇させ、他科目は変化させない
- [ ] `CultivationProgress.completeLearningUnit` は `learningUnit.curriculumId !== curriculum.id` のとき例外を投げ、状態を変更しない
- [ ] `CultivationProgress.completeLearningUnit` を同一ユニットに対して複数回呼んでも、その都度上昇する（上限100まで）
- [ ] `UnderstandingLevel.zero` は `correctCount=0, totalCount=0, rate=0` で生成される
- [ ] `UnderstandingLevel.create` は `correctCount > totalCount` のとき例外を投げる
- [ ] `UnderstandingLevel.recordAttempt(true)` は `correctCount` と `totalCount` を両方+1する
- [ ] `UnderstandingLevel.recordAttempt(false)` は `totalCount` のみ+1する（`correctCount`は変化しない）
- [ ] `UnderstandingLevel.rate` は `totalCount=0` のとき0、それ以外は四捨五入した正答率(%)を返す
- [ ] `UpcomingExam` は `targetLearningUnitIds` が空配列のとき生成時に例外を投げる
- [ ] `Mission.assignDaily` は `targetLearningUnitIds.length === 1` のMissionを生成する
- [ ] `Mission.offerMockExam` は `upcomingExam.targetLearningUnitIds` と同一の `targetLearningUnitIds` を持つMissionを生成する
- [ ] `lowestUnderstandingRateFirstPolicy.selectFocusUnit` は対象単元の中で最も `rate` が低いIDを返す
- [ ] `lowestUnderstandingRateFirstPolicy.selectFocusUnit` は理解度未記録（`UnderstandingLevel`が存在しない）単元を `rate=0` として扱い、優先的に選ぶ
- [ ] `CultivationProgress.recordAttempt` は指定した `learningUnitId` の `UnderstandingLevel` のみを更新し、他の単元・`SubjectAbility` には影響しない
- [ ] `CultivationProgress.assignDailyMission` は理解度最低の1単元を対象とする `type="Daily"` のMissionを生成し、`getCurrentDailyMission()` で取得できる
- [ ] `CultivationProgress.offerMockExamMission` は `upcomingExam` の出題範囲全体を対象とする `type="MockExam"` のMissionを生成し、`getMockExamMission()` で取得できる

### 出題形式モデル（第4回ヒアリング分）のテスト不変条件 — 実装・テスト済み

- [x] `QuestionType` の妥当な値（3種）・`isQuestionType` の真偽判定
- [x] `subjectQuestionTypePolicy`: `English` は3形式すべてでtrue
- [x] `subjectQuestionTypePolicy`: English以外の科目は `VocabularyTest` を含めどの形式もfalse
- [x] `LearningUnit.create` は `questionType` を省略した場合 `questionType = null` で生成できる（既存の文法単元との後方互換）
- [x] `LearningUnit.create` は `subject` と `questionType` の組み合わせが `SubjectQuestionTypePolicy` を満たせば正常に生成できる
- [x] `LearningUnit.create` は `subject` が `questionType` をサポートしない場合（例: `Math` × `VocabularyTest`）に例外を投げる

## スコープ外（残課題。本追記には含まない）

1. **`CultivationProgressRepository`（永続化）**: ドメイン層設計時点では未設計だったが、動作確認用システム構築時にインメモリ実装込みで用意した（`tasklist.md` 参照）。具象実装 `FirebaseCultivationProgressRepository` を実装済み。Firestoreの `cultivationProgress/{studentId}` コレクションに `{ grade, abilities, understandingLevels, currentDailyMission, currentMockExamMission }` の形で永続化する。復元時は `CultivationProgress.reconstruct` を使う（詳細は `tasklist.md` 7番参照）。
2. **ユースケース層（例: `CompleteLearningUnit` / `RecordAttempt` / `GenerateDailyMission`）**: 同上、動作確認用システム構築時に実装済み（`tasklist.md` 参照）。
3. **difficulty（難易度）の意味**: 現状 `number` 型のみで制約なし。値域や上昇量との連動（難易度が高いほど上昇量が大きい等）は今回採用しなかった（上昇量は固定）。将来変更する場合は改めて仕様化する。
4. **Missionの完了状態管理**: 生徒がMissionを「実施した／していない」をトラッキングする仕組み。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。既存の `recordAttempt`/`completeLearningUnit` による学習状況の追跡で十分とする。
5. **デイリーミッション・モック模試ミッションの一意性制御**: 同じ日・同じ試験に対する重複生成を防ぐ仕組み。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。何度生成しても上書きされる現在の挙動を維持する。
6. **進級（Gradeの変更）**: `CultivationProgress.initiate` で確定した `Grade` を後から変更する操作（例: セカンドグレード→サードグレードへの進級）。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。対応グレードのコンテンツ整備（次項）を優先する。
7. **First/Third/Fourth/Fifth/Sixthグレードの中身**: `Grade` 型には定義済みだが、対応する `ExamType`・`Curriculum`・`LearningUnit` はまだ無い。学年を1つ開放するごとに、`ExamType` への追加・`GradeExamTypePolicy` の `REGULAR_EXAM_TYPE_BY_GRADE` への追加・該当カリキュラムの用意が必要。ヒアリングの結果、今回は不要と判断し見送った（`README.md`/`CLAUDE.md` 記載の対応学習領域の範囲外、`tasklist.md` 参照）。
8. **大学受験（最終ゴール）**: 「シックスグレードの先にあるゴール」という位置づけのみで、型やExamTypeとしては未着手。ヒアリングの結果、今回も不要と判断し見送った（第1回ヒアリングの結論を再確認）。
9. **問題文・単語リスト・正解などのコンテンツ本体**: `QuestionType` はあくまで「出題形式の種類」という構造情報のみ。実際の単語リスト・本文・和訳/英訳の正解例などのコンテンツ本体は、`CLAUDE.md` の方針通りFirestoreに格納する想定で、今回はモデル化・実データ投入のいずれも行っていない（動作確認用のseedDataはタイトルのみのダミー）。→ 第7回ヒアリングで`Question`エンティティとして実装済み（下記参照）。現状は数学の2ユニットのみ実データあり。
10. **English以外の科目のQuestionType**: `SubjectQuestionTypePolicy` は `English` のみ対応表を持つ。他科目（数学の「計算問題」等）に出題形式を追加する場合は、改めてヒアリングのうえ `QUESTION_TYPES_BY_SUBJECT` に追加する。→ 第6回ヒアリングで `Math`（`Calculation`/`WordProblem`）を追加済み（下記参照）。`Japanese`/`Science`/`SocialStudies` は引き続き未対応。

これらは `tasklist.md` に別タスクとして追加する。
