# 戦術的仕様: 魔力修練コンテキスト (Mana Cultivation Context)

用語定義は `../glossary.md` の「2. 魔力修練コンテキスト」を参照。本ドキュメントは既存実装 (`src/contexts/mana-cultivation/`) を仕様として明文化したものである。

## 現在の実装範囲

モデル化されているのは次の5つ:
1. 「どの学年・試験種別がどの出題範囲・難易度構成を持つか」という**カリキュラムの構造**（`CLAUDE.md` の学習コンテンツ配置方針に対応）。
2. 「主要5科目の学習（学習ユニットの完了）によって、生徒の科目別能力が成長する」という**能力成長ルール**（ユーザーヒアリング済み、下記「意思決定の経緯（第1回）」参照）。
3. 「過去の間違い問題から単元理解度を算出し、次のテスト範囲からデイリーミッションを生成する。また次テスト範囲の予想問題ミッションを選択できる」という**ミッション生成ルール**（ユーザーヒアリング済み、下記「意思決定の経緯（第2回）」参照）。
4. 「中1〜高3を貫く7段階の学年進行（Grade）のうち、プレ期間（小6）とセカンドグレード（中2）を選択できる」という**学年段階モデル**（ユーザーヒアリング済み、下記「意思決定の経緯（第3回）」参照）。
5. 「英語に単語テスト・本文の和訳・英訳問題、数学に計算問題・文章題、国語に漢字の書き・読みという出題形式を追加する」という**出題形式モデル**（ユーザーヒアリング済み、下記「意思決定の経緯（第4回・第6回・第8回・第10回）」参照）。
6. 「漢字小テスト（I・II）・英単語を1問ずつ解答・採点し、中断しても続きから再開できる」という**テスト受験フロー**（ユーザーヒアリング済み、下記「意思決定の経緯（第9回・第13回）」参照）。
7. 「学習ユニットに、採点対象ではない読み物・解説（本文・文法ポイント）を持たせられる」という**参照用テキストモデル**（`LearningUnit.referenceText`。ユーザーヒアリング済み、下記「意思決定の経緯（第14回）」参照）。
8. 「学習ユニットの参照用テキストに、聞き取り用の読み上げ音声を持たせられる」という**参照用音声モデル**（`LearningUnit.referenceAudioUrl`。ユーザーヒアリング済み、下記「意思決定の経緯（第15回）」参照）。

項目1〜4はドメイン層に加え、動作確認用のユースケース層・インメモリインフラ層・UIまで実装済み（`tasklist.md` 参照）。項目5〜8もドメイン層・Firebaseインフラ層・UIまで実装済み。

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
3. **実データ**: 今回は例として数件作成する。対象は現在 `questionType` を持つ唯一のユニット群（数学の `unit-math-calc-1` / `unit-math-word-1`）。第1章「式の計算」の計算問題3件、第6章「確率と標本調査」の文章題2件を作成した（のち、チャート式 体系数学2 代数編の例題100「樹形図の利用」を文章題として1件追加し、計3件）。英語の単語テスト・和訳・英訳問題は、対応するLearningUnitが現状存在しないため今回は対象外（将来追加する場合は同じ`Question`の仕組みで対応できる）。

## 意思決定の経緯（第8回ヒアリング: 漢字小テストIの追加）

実装前にユーザーへ確認し、以下の方針で合意済み:

1. **対象科目・ソース**: `Japanese`（国語）に初めて `QuestionType` を追加する。ユーザー提供ファイル（「漢字テスト（第一回）」、カタカナを含む文56問＋熟語の解答）を「中2の漢字小テストI」として登録する。残りの小テストII・IIIは別途データが提供された時点で後日追加する（本追記のスコープ外）。
2. **追加するQuestionType**: `KanjiWriting`（漢字の書き）・`KanjiReading`（漢字の読み）の2種類。`QUESTION_TYPES_BY_SUBJECT.Japanese` に追加（従来は空だった）。
3. **LearningUnitの分割**: 「書き」と「読み」は同じ元データ（56問）から生成するが、別々の `LearningUnit`（`unit-japanese-kanji-test1-write` / `unit-japanese-kanji-test1-read`）として表現する（既存の「出題形式は単元とは独立した別概念」という第4回ヒアリングの方針を踏襲）。
4. **読み（ふりがな）データの扱い**: ソースファイルには「書き」の解答（熟語）のみ含まれ、読みの数据は明記されていなかった。確認の結果、各問題文中のカタカナ区間自体が読みの正解と完全に一致しており（モデルが新たに知識を生成するのではなく、ソース内の既存データをそのまま機械的に抽出できる）、56問全件をこの方法で導出した。導出結果は実装前にユーザーへ提示し、承認を得た。
5. **実データ**: 56問分の `Question`（書き56件・読み56件、計112件）を `unit-japanese-kanji-test1-write` / `unit-japanese-kanji-test1-read` にそれぞれ投入した。

### Question（エンティティ）

```ts
type QuestionProps = { id: string; learningUnitId: string; prompt: string; answer: string; explanation?: string; imageUrl?: string };

class Question {
  static create(props: QuestionProps): Question; // prompt/answerが空文字なら例外
  static reconstruct(props: QuestionProps): Question; // 永続化データを信頼し、再検証しない
  readonly id: string;
  readonly learningUnitId: string;
  readonly prompt: string;
  readonly answer: string;
  readonly explanation: string | null; // 正解に添える解説・考え方。採点対象外の表示用テキスト（省略時null）
  readonly imageUrl: string | null; // 問題に添える図・写真のURL（省略時null。第17回ヒアリング）
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

## 意思決定の経緯（第9回ヒアリング: テスト受験フロー・QuizSession）

ユーザーから画面構成案（進捗バー・入力欄・中断時の再開ダイアログ・オートセーブ）のペーストを受け、実装前にユーザーへ確認し、以下の方針で合意済み:

1. **対象範囲**: まず「漢字小テストI（書き・読み）」の2ユニットのみを対象とする。他のQuestionTypeを持つユニット（数学等）への展開は、同じ仕組みをそのまま流用して後日拡張する。
2. **中断データの保存単位**: 既存の `CultivationProgress` 集約には含めず、新しい集約ルート `QuizSession`（生徒×学習ユニット単位）として新設する。
3. **成長ロジックとの連動**: 連動する。1問答えるたびに既存の `recordAttempt`（理解度記録）を呼び、最終問題を解き終えたら既存の `completeLearningUnit`（能力成長）も呼ぶ。出題形式ごとの独自の成長ロジックは追加しない（第4回ヒアリングの方針を踏襲）。
4. **正誤判定方法**: 完全一致のみ（前後の空白はトリムして許容）。全角/半角等の表記ゆれの正規化は今回行わない。
5. **一覧画面の「進行中40%」バッジ表示**: 今回のスコープに含めない（任意の改善として見送り）。クイズ画面内の進捗バー・オートセーブ・再開ダイアログというコア体験に集中する。
6. **UIコンポーネント**: デザインシステム（`project/components/`）には進捗バー・入力フォームに相当する仕様が無いため、新規コンポーネントとして追加するのではなく、既存の意味トークン（`house-*`）と `GrimoireCard` 相当のスタイルを使ってローカルに実装する。

### QuizSession（エンティティ・集約ルート）

```ts
type QuizSessionProps = {
  studentId: StudentId;
  learningUnitId: string;
  totalQuestions: number;
  currentIndex: number;
};

class QuizSession {
  static start(studentId: StudentId, learningUnitId: string, totalQuestions: number): QuizSession; // currentIndex=0。totalQuestions<=0なら例外
  static reconstruct(props: QuizSessionProps): QuizSession; // 永続化データを信頼し、再検証しない
  readonly studentId: StudentId;
  readonly learningUnitId: string;
  readonly totalQuestions: number;
  get currentIndex(): number;
  get isComplete(): boolean; // currentIndex >= totalQuestions
  get progressRatio(): number; // currentIndex / totalQuestions
  advance(): void; // currentIndexを1つ進める。完了済みなら例外
}
```

- **不変条件**:
  1. `start()` は `totalQuestions <= 0` の場合に例外を投げる。
  2. `advance()` は、既に `isComplete` が `true`（＝`currentIndex >= totalQuestions`）の場合に例外を投げ、状態を変更しない。
  3. `advance()` が成功するたびに `currentIndex` がちょうど1増える。

### AnswerCorrectnessPolicy（仕様）

```ts
interface AnswerCorrectnessPolicy {
  isSatisfiedBy(submittedAnswer: string, correctAnswer: string): boolean;
}

const answerCorrectnessPolicy: AnswerCorrectnessPolicy = {
  isSatisfiedBy: (submittedAnswer, correctAnswer) => submittedAnswer.trim() === correctAnswer.trim(),
};
```

### QuizSessionRepository（インターフェース）

```ts
interface QuizSessionRepository {
  find(studentId: StudentId, learningUnitId: string): Promise<QuizSession | null>;
  save(session: QuizSession): Promise<void>;
  delete(studentId: StudentId, learningUnitId: string): Promise<void>;
}
```

具象実装 `FirebaseQuizSessionRepository`（`infrastructure/firebase/`）。Firestoreの `quizSessions/{studentId}/units/{learningUnitId}` サブコレクションに `{ totalQuestions, currentIndex }` の形で永続化する。他の per-student コレクションと同じ `request.auth.uid == studentId` ルールで保護する。「1回解ききるまで保持し、解ききったらリセット」は、完了時にこのドキュメントを `delete()` することで表現する（次回開始時は `find()` が `null` を返すため、新規セッションとして扱われる）。

### ユースケース

```ts
class FindQuizSession {
  constructor(quizSessionRepository: QuizSessionRepository);
  execute(studentId: StudentId, learningUnitId: string): Promise<QuizSession | null>;
}

class StartQuiz {
  constructor(quizSessionRepository: QuizSessionRepository);
  // 既存セッションの有無に関わらず常にcurrentIndex=0の新しいセッションで上書きする
  // （「最初からやり直す」も同じ呼び出しで表現する）。
  execute(studentId: StudentId, learningUnitId: string, totalQuestions: number): Promise<QuizSession>;
}

class SyncQuizProgress {
  constructor(
    quizSessionRepository: QuizSessionRepository,
    cultivationProgressRepository: CultivationProgressRepository,
    curriculumRepository: CurriculumRepository,
    learningUnitRepository: LearningUnitRepository,
  );
  // 1. results（複数問分の正誤）をCultivationProgress.recordAttempt(learningUnitId, isCorrect)でまとめて記録
  // 2. 既存QuizSessionがあれば取得（無ければstart）、results件数分advance()
  // 3. 完了していなければセッションを保存
  // 4. 完了していれば CultivationProgress.completeLearningUnit(curriculum, learningUnit) を呼び、セッションを削除（リセット）
  execute(
    studentId: StudentId,
    learningUnitId: string,
    results: { isCorrect: boolean }[],
    totalQuestions: number,
  ): Promise<{ session: QuizSession | null }>;
}
```

> 初版（第9回ヒアリング時点）では1問ごとにサーバーへ送信する `SubmitQuizAnswer` だったが、第11回ヒアリングで `SyncQuizProgress`（複数問まとめて送信）に置き換えた。詳細は下記「意思決定の経緯（第11回ヒアリング）」を参照。

`src/app/academy/page.tsx` に「テストを受ける」ボタンを新設（既存の読み取り専用の「問題を見る」とは別UI）。クリック時に `FindQuizSession` で中断データの有無を確認し、中断中であれば「続きから／最初からやり直す」ダイアログを表示する。無ければ `StartQuiz` で新規開始する。正誤判定はクライアント側で `answerCorrectnessPolicy` を直接呼んで行い（全問のQuestionデータは`fetchQuestions`でテスト開始時に端末へダウンロード済み）、結果は端末内に蓄積。完了時または「◀ 戻る」での中断時に `SyncQuizProgress` でまとめてサーバーへ同期する。進捗バー・正誤フィードバック・完了時の結果画面を表示する。

## 意思決定の経緯（第10回ヒアリング: 漢字小テストIIの追加）

ユーザー提供ファイル（`kanji_test_02.txt`、「漢字テスト（第二回）」77問）を「中2の漢字小テストII」として登録。第8回ヒアリングと同じ構成（`LearningUnit`を書き・読みの2ユニットに分割し、`Question`を機械的に導出する）を踏襲したが、今回は導出時に次の問題が見つかった:

1. **ソースの表記ゆれ**: 小テストIとは異なり、小テストIIは77問中7問（2, 7, 16, 23, 30, 31, 33番）で、問題文中のカタカナが解答の熟語の正しい読みと一致しなかった（主に濁点の誤り。例: 「軌道」の読みが「ぎどう」になっていた等）。
2. **対応方針（ユーザー確認済み）**: 「読み」テストの正解には、ソースのカタカナをそのまま変換した文字列ではなく、熟語の標準的な正しい読みを採用する。「書き」テストの問題文（カタカナを含む文）はユーザー提供のソースのまま変更しない。該当7問の詳細は `infrastructure/memory/seedData.ts` の `KANJI_TEST_2_ITEMS` 直前のコメントを参照。
3. **実データ**: 77問分の `Question`（書き77件・読み77件、計154件）を新設した `unit-japanese-kanji-test2-write` / `unit-japanese-kanji-test2-read` にそれぞれ投入した。
4. **テスト受験フロー（QuizSession）との関係**: 「テストを受ける」機能（第9回ヒアリング）は特定の学習ユニットIDに依存せず、`questionType` を持つユニット全般に汎用的に動作する設計のため、コード変更無しで小テストIIにもそのまま適用される。

## 意思決定の経緯（第11回ヒアリング: テスト受験フローのバッチ化）

第9回ヒアリングで実装した「テスト受験フロー」は、1問答えるたびに `SubmitQuizAnswer` でサーバー（Firestore）へ同期していた。漢字小テストのように問題数が多い（56〜77問）場合、1問ごとの通信待ちでユーザビリティが低下するとユーザーから指摘を受け、実装前にユーザーへ確認し、以下の方針で合意済み:

1. **ダウンロードのタイミング**: テスト開始時に全問題（`prompt`/`answer`含む）を一括取得する。これは `fetchQuestions`（`GetQuestionsForLearningUnit`）が既に行っていたため、変更不要だった。
2. **正誤判定**: サーバー側（旧`SubmitQuizAnswer`内）ではなく、クライアント側で `answerCorrectnessPolicy`（ドメイン仕様オブジェクトをUI層から直接呼び出す。ロジック自体はドメイン層のまま）を使って行う。全問の正解データは手順1で既に端末にダウンロード済みのため、新たな情報漏洩は生じない。
3. **サーバーへの同期タイミング**: 1問ごとではなく、「テスト完了時」または「◀ 戻る（中断して閉じる）」時のみ、まとめて1回のリクエストで同期する。テスト中の各問の正誤はクライアント側の変数（メモリ上）に蓄積するのみで、通信は発生させない。
4. **予期せぬ終了時のデータ損失**: ブラウザタブが突然閉じられる・アプリがクラッシュするなど、上記2つの同期タイミングを経由せずに終了した場合、その回でまだ同期していない分の進捗は失われてよい（`beforeunload`等でのベストエフォート同期は行わない。シンプルな実装を優先する方針で合意）。
5. **ユースケースの置き換え**: 1問ごとの `SubmitQuizAnswer` は廃止し、複数問の結果をまとめて受け取る `SyncQuizProgress` に置き換える。`QuizSession`（エンティティ）自体に変更は無い（`advance()` を結果件数分ループ呼び出しするだけで、既存の不変条件をそのまま利用できる）。`QuestionRepository` への依存は無くなる（正誤判定をサーバー側で再検証しないため）。

### SyncQuizProgress（ユースケース、`SubmitQuizAnswer`を置き換え）

実際の型定義は上記「ユースケース」節の `SyncQuizProgress` を参照。

## 意思決定の経緯（第12回ヒアリング: 漢字「書き」のセルフ採点・5問セット化）

ユーザーから画面構成案のペーストを受け、実装前にユーザーへ確認し、以下の方針で合意済み:

1. **対象範囲**: このセルフ採点形式（「正解を見る」→自分で正解・不正解を選ぶ）および5問セット化は `KanjiWriting`（漢字の書き）のみを対象とする。`KanjiReading`（読み）を含む他のQuestionTypeは、第11回ヒアリングで実装したテキスト入力＋自動採点・全問一括のフローを維持する（手書きで確認する「書き」はテキスト入力で正誤を機械判定できないための対応）。
2. **入力方式**: 「書き」は解答欄を持たない。問題文（カタカナ部分を強調表示）→「正解を見る」ボタン→正解の漢字を表示→「正解（覚えた！）」／「不正解（もう一度）」の2ボタンで生徒自身が採点する。
3. **5問セットとサーバー同期**: `SELF_GRADED_SET_SIZE = 5` 問を1セットとする。全問データ自体はテスト開始時に一括ダウンロード済み（第11回踏襲）のためセットごとの追加フェッチは発生しない。サーバーへの同期（`SyncQuizProgress`）は、1問ごとでも全体完了時でもなく、**5問セットの区切り**（最後の問題を採点した直後）に行う。既存の `QuizSession`/`SyncQuizProgress` は変更不要（`results` の長さが5件（最後のセットは端数）になるだけ）。
4. **セット途中の中断**: 明示的に「◀ 戻る」で閉じた場合は、その時点までの未同期分（セット未満の件数）を`SyncQuizProgress`で同期する。ブラウザが予期せず閉じられた場合はセット途中の分が失われてよい（第11回ヒアリングの方針を踏襲）。
5. **結果画面とボーナス周回**: セット完了ごとに結果画面（セット内の正誤一覧、`SetReviewList`）を表示する。「次の5問に進む」「間違えた問題だけをやり直す」「もう一度この5問を解く」「テスト選択へ戻る」を提供する。後者2つの「やり直し」は本来の出題進捗（`QuizSession.advance()`）には影響させず、理解度記録（`recordAttempt`）のみを追加で行う新しいユースケース `RecordQuizAttempts` を使う（＝ボーナス練習という位置づけ。やり直しのたびに`QuizSession.currentIndex`が余計に進んでしまう不具合を避けるため）。
6. **演出**: デザインシステムに該当コンポーネントが無く、紙吹雪エフェクトや効果音は今回のスコープに含めない。`prefers-reduced-motion`を尊重する軽量なテキスト主体の演出に留める。

### RecordQuizAttempts（ユースケース）

```ts
class RecordQuizAttempts {
  constructor(cultivationProgressRepository: CultivationProgressRepository);
  // resultsそれぞれについてCultivationProgress.recordAttemptを呼ぶのみ。
  // QuizSessionには一切触れない（本来の出題進捗とは無関係なボーナス練習のため）。
  execute(studentId: StudentId, learningUnitId: string, results: { isCorrect: boolean }[]): Promise<void>;
}
```

`src/app/academy/page.tsx` に `SelfGradedQuizPanel`（`KanjiWriting`専用）を新設。`QuizTakingPanel`（テキスト入力式）とはクイズ起動処理（`useQuizBootstrap`フック、全問の先読み・中断セッション確認・新規開始を共通化）を共有しつつ、採点UI・同期タイミングは独立して実装する。`LearningUnitRow` は `unit.questionType === "KanjiWriting"` で表示するパネルを切り替える。

## 意思決定の経緯（第13回ヒアリング: 英語「単語マスター」モードの追加）

ユーザーから英語学習の5モード案（単語マスター／シャドーイング／文法・Speakチェック／本文・翻訳トレーニング／ニガテ復習）のペーストを受け、実装前にユーザーへ確認し、以下の方針で合意済み:

1. **着手順**: 5モードを一度に実装するには大きすぎるため、まず「単語マスター」のみ着手する。他4モードは後日改めてヒアリングする（シャドーイングは教科書音声素材・ブラウザの音声認識対応状況、ニガテ復習は問題単位の履歴記録という新しいドメイン概念が必要になるなど、モードごとに前提が大きく異なるため）。
2. **解答方式**: 英単語→日本語訳の自由記述式は訳語の表現ブレが大きく自動採点に向かないため、4択形式を採用する。誤答選択肢は、同じ学習ユニット内の他の単語の訳をUI側でランダムに流用して生成する（誤答選択肢専用のデータは持たない）。選択した瞬間に正誤が確定する（サーバー側の再検証は行わない。既にテスト開始時に全問の正解データを端末にダウンロード済みのため、新たな情報漏洩は生じない）。
3. **既存の`QuestionType`を流用**: `VocabularyTest`は第4回ヒアリングで定義済みだが実データが無く未使用だった。今回新しいQuestionTypeは追加せず、この型をそのまま使う。
4. **進行方式**: 漢字「書き」と同じ5問セット単位（`SELF_GRADED_SET_SIZE`）で進行・同期する。ドメイン層（`QuizSession`/`SyncQuizProgress`/`RecordQuizAttempts`）は正誤判定の方法に関心を持たないため、変更は不要。
5. **実データ**: ユーザー提供の単語リスト5件（Lesson 1-2 新出語彙）で「単語マスターI」を作成した。→ その後、同じLesson 2の範囲を網羅した全104件のリスト（旧5件を含む）が提供されたため、「単語マスターI（Lesson 2 新出語彙）」として全件に更新した（後述）。

### 実装（ドメイン層の変更なし、UI層のみ）

4択の正誤判定・誤答選択肢の生成はUI層の関心事であり、ドメインロジックではない（`AnswerCorrectnessPolicy`のような仕様オブジェクト化は不要。単純な文字列比較のみで、ビジネスルールと呼べる判断を含まないため）。このため新しいドメイン層コードは無い。

- `buildChoices(allQuestions, correct)`: 同一学習ユニットの他の`Question.answer`から3件をランダムに抽出し、正解と合わせてシャッフルした4択配列を返す純粋関数（`src/app/academy/page.tsx`）。
- `VocabularyChoiceStep` / `MultipleChoiceQuizPanel`: 選択→フィードバック表示→「次へ」クリックで確定、という2段階にし、選択した瞬間に即座に次の問題へ切り替わらないようにしている（選択と同時に判定・前進を1つの関数で行うと、同一レンダーサイクル内でフィードバックが一瞬で消えてしまうため）。
- 漢字「書き」（`SelfGradedQuizPanel`）との共通部分（5問セットの進行・サーバー同期・ボーナス周回・結果画面）は `useSetBasedQuiz` フックと `SetResultScreen` コンポーネントに抽出し、両パネルで共有する。

### 更新: 単語マスターIをLesson 2全域（99語）に拡張

ユーザーから、前回登録した5件を含むLesson 2の新出語彙の完全なリスト（`L2単語.rtf`、全104行）が提供され、「メンテしてアップデート」の指示を受けた。

1. **データの精査**: 104行を機械的に突き合わせたところ、53〜57番が48〜52番（sponge/a pair of ~/scissors/cut/cloth）と完全に重複していることが判明した。重複5件を除いた99件をユニークなデータとして採用した。
2. **既存ユニットの更新**: 新しいユニットを作らず、既存の `unit-english-vocab-1` の `title` を「単語マスターI（Lesson 2 新出語彙）」に変更し、`Question`（旧5件→新99件）を上書きした。QuestionTypeやドメイン層の変更は無い。
3. **一覧表示の並び順**: 英語のようにまだ大半のユニットが`questionType`を持たない（＝実データが無く「準備中」表示の）科目では、実際に取り組める単語マスターが埋もれてしまうため、`LibraryTab`の単元一覧を「`questionType`を持つユニットを先に表示する」よう並び替えるようユーザーから指示を受けた（ユーザー指示のため追加ヒアリングは行わず実装）。

## 意思決定の経緯（第14回ヒアリング: Lesson 2 Scene 1の本文・文法・例文練習の追加）

ユーザーから「Lesson 2 Scene 1（感嘆文）の会話文・文法ポイント・例文練習」のテキスト（`L2-S1.txt`）が提供され、実装前にユーザーへ2点を確認し、以下の方針で合意済み:

1. **例文練習の採点方式**: 例文練習3問（日本語の感嘆文→英訳）は、第13回ヒアリングと同じ理由（英訳は言い回しの自由度が高く、完全一致判定だと不自然に不正解になる）で自由記述の自動採点に向かない。一方、単語マスターと同じ4択にすると英作文の練習にならない。ユーザーの指示により、**正解の英文を単語単位に分割してシャッフルし、選んだ順に並べさせる「並べ替え」形式**を採用する。並べた単語列（スペース結合）と正解文字列が完全一致するかどうかで自動判定できるため、自由記述と違って表記ゆれの問題が起きない。
2. **会話文・文法ポイントの扱い**: 会話文（Tom/Grandma/Maryの会話）と文法ポイント（感嘆文の作り方の説明）は採点対象の「問題」ではなく読み物・解説として扱う。ユーザーの指示により、`LearningUnit`に新しい任意項目`referenceText`を追加し、既存の文法単元（`unit-english-l2-s1`、第4回ヒアリングの方針により`questionType`を持たない）にまとめて格納する。
3. **単元の分離**: 単語テスト・本文の和訳・英訳問題は文法単元とは別のLearningUnitとして表現する、という第4回・第6回・第8回・第10回ヒアリングの既存方針に従い、例文練習（英作文の並べ替え）は`unit-english-l2-s1`とは別の新しいLearningUnit（`unit-english-l2-s1-practice`、`questionType: "PassageTranslationToEnglish"`）として登録する。この`QuestionType`は第4回ヒアリングで定義済みだが実データが無く未使用だったため、新しいQuestionTypeの追加は不要。

### 実装

**ドメイン層の変更**: `LearningUnit`に`referenceText: string | null`を追加（`LearningUnitProps.referenceText?: string`、`create`/`reconstruct`両方で受け取る）。採点や能力成長などの既存の不変条件には関与しない、単純な表示用データのため、`questionType`との組み合わせに関する新しい制約は設けない（両方null、両方あり、片方だけ、のいずれも許容）。`GetCultivationOverview`の`LearningUnitView`・`FirebaseLearningUnitRepository`・`scripts/seedFirestore.ts`に`referenceText`の読み書きを追加した。

**UI層の変更（並べ替え採点はUI層の関心事。第13回ヒアリングの4択と同じ判断でドメイン層には追加しない）**:
- `WordOrderQuizPanel`（`PassageTranslationToEnglish`専用）: 正解の英文を空白区切りでトークン化し`shuffledTokens`でシャッフルして「単語バンク」に表示、タップした順に「解答欄」へ積む。「採点する」ボタン（全トークンを使い切るまで無効）で判定し、正誤表示→「次へ」ボタンで確定、という単語マスターと同じ2段階方式（判定と前進を同じ関数で行うとフィードバックが一瞬で消えるバグを避けるため）。漢字「書き」・単語マスターと同じ`useSetBasedQuiz`を共有し、5問セット単位で進行・同期する（この単元は3問なので実質1セット）。
- `LearningUnitRow`: `referenceText`を持つ単元には「本文・文法を見る」トグルボタンを表示する（`questionType`の有無に関係なく独立に表示できる）。「準備中」バッジの表示条件を「`questionType`も`referenceText`も無い」に変更した（`referenceText`だけ持つ文法単元が「準備中」と誤表示されないようにするため）。

### テストで守る不変条件

- `LearningUnit.create`/`reconstruct`は`referenceText`を省略した場合`null`になる（既存の挙動を壊さない）。
- `LearningUnit.create`は`referenceText`があっても`questionType`が無い組み合わせを許容する（例外を投げない）。

## 意思決定の経緯（第15回ヒアリング: 本文の聞き取り音声の追加）

ユーザーから「英語の本文をリスニングしたいので、gTTS（Google Text-to-Speech）を使って本文を読み上げるようにしてほしい」という依頼を受け、実装前にユーザーへ2点を確認し、以下の方針で合意済み:

1. **音声の保存方法**: このプロジェクトはFirebase Cloud Storageを一度も使っておらず（`firebase.json`にstorageターゲットが無い）、CLIからの有効化（`firebase deploy --only storage`）を試みたところ「Firebase Storageが未セットアップ」エラーとなり、Firebaseコンソールでの手動セットアップ（Blazeプランへのアップグレードを求められる可能性あり）が必要だった。ユーザーに確認したところ、コンソール操作は行わず、代わりに生成した音声ファイルをNext.jsの`public/audio/`配下に静的アセットとして同梱する方式を選んだ。これは`CLAUDE.md`の「音声/画像はFirestore/Cloud Storageに格納する」という本来方針から一時的に外れる運用判断であり、将来Cloud Storageを有効化した際に移行する想定として明記しておく。
2. **読み上げの対象テキスト**: `referenceText`には文法ポイントの説明や日本語訳の注釈（全角括弧）・ト書き（半角括弧）も含まれているため、そのまま音声化すると不自然になる。ユーザーの指示により、会話文のうち**英語のセリフ部分のみ**（ト書き・日本語訳を除く）を読み上げ対象とする。

### 実装

**ドメイン層の変更**: `LearningUnit`に`referenceAudioUrl: string | null`を追加（`referenceText`と同じパターン。`LearningUnitProps.referenceAudioUrl?: string`、`create`/`reconstruct`両方で受け取る）。`referenceText`とは独立した任意項目で、組み合わせの制約は無い。`GetCultivationOverview`の`LearningUnitView`・`FirebaseLearningUnitRepository`・`scripts/seedFirestore.ts`に読み書きを追加した。

**コンテンツ生成（一度だけ実行する一時的な作業、リポジトリにスクリプトは残さない）**: ローカルに`pip3 install gTTS`でPythonパッケージを導入し、会話文の英語セリフ6行（ト書き・日本語訳を除いたもの）を1つのmp3（`public/audio/lesson2-scene1.mp3`）として生成した。`unit-english-l2-s1`の`referenceAudioUrl`にこの静的パスを設定した。

**UI層の変更**: `LearningUnitRow`の「本文・文法を見る」トグル内（`referenceText`表示ブロック）に、`referenceAudioUrl`がある場合のみ`<audio controls>`プレイヤーを追加した。

### テストで守る不変条件

- `LearningUnit.create`/`reconstruct`は`referenceAudioUrl`を省略した場合`null`になる。
- `LearningUnit.create`は`referenceAudioUrl`と`referenceText`を同時に持つ組み合わせを許容する（例外を投げない）。

## 意思決定の経緯（第16回ヒアリング: 入学後の学年段階の切り替え）

ユーザーから「鑑定画面で小6か中2か選択できるようにしたい」という依頼を受けた。これまで`Grade`は入学時（`StartCultivation`）に一度だけ選び、`CultivationProgress.grade`として以後変更できなかった（「残課題」の進級操作が未着手だったのと同じ理由）。実装前にユーザーへ3点を確認し、以下の方針で合意済み:

1. **使い方**: 選んだ学年を`CultivationProgress`に保存し、次回以降もその学年で修練場が開く（起動ごとに選ばせる方式ではない）。入学済みの生徒は起動時に`/`から`/academy`へ自動遷移する現在の動きはそのまま残し、切り替えたいときだけ鑑定画面（修練場の「← 鑑定画面」から戻った「おかえりなさい」カード）で選び直す。
2. **能力値の扱い**: `SubjectAbility`は学年をまたいで科目ごとに1つのまま共通とする（学年ごとに分けない）。単元ごとの`UnderstandingLevel`は単元IDがキーなので、学年を切り替えても各単元の記録はそのまま残り、元の学年に戻せば再び見える。
3. **ミッションの扱い**: 切り替え時に、現在のデイリーミッション・モック模試ミッションを取り消す（元の学年の試験の単元を指したまま新しい学年の修練場に出るのを防ぐ）。新しい学年で改めて受け取る。

### 実装

**ドメイン層の変更**: `CultivationProgress`に`changeGrade(grade: Grade): void`を追加し、`grade`を`readonly`フィールドから「読み取り専用のgetter＋集約内でのみ書き換え」に変える。切り替え先は`LAUNCHED_GRADES`（提供中の学年段階）に限定し、それ以外なら例外を投げて状態を変えない。現在と同じ学年を指定した場合は何もしない（ミッションも消さない）。

**ユースケース層**: `ChangeGrade`ユースケース（`usecase/ChangeGrade/`）を新設。`CultivationProgressRepository`から読み込み→`changeGrade`→保存。進捗が存在しない（未入学）場合は例外。

**UI層**: 鑑定画面の「おかえりなさい」カードに、`LAUNCHED_GRADES`の学年ボタン（小6／中2）を表示し、現在の学年を選択状態にする。別の学年を押すと`ChangeGrade`→`refreshOverview`を実行する。

### テストで守る不変条件

- `changeGrade`は`grade`を新しい値に更新し、`SubjectAbility`と`UnderstandingLevel`を一切変えない。
- `changeGrade`で別の学年に変えると、デイリーミッション・モック模試ミッションはどちらも`null`になる。
- 現在と同じ学年を指定した`changeGrade`は何も変えない（ミッションも残る）。
- `LAUNCHED_GRADES`に含まれない学年（例: `Third`）を指定すると例外を投げ、`grade`もミッションも変わらない。
- `ChangeGrade`ユースケースは変更後の進捗を保存し、進捗が存在しなければ例外を投げる。

## 意思決定の経緯（第17回ヒアリング: 小6社会の4択・一問一答の追加）

ユーザーから、小6社会の問題集「コンプリーション」（`content-workshop/output/pre-social-01〜15`の9単元。写真から書き起こしたmd）をアプリに登録し、「選択での4択」と「一問一答で、次のページに解答が表示される」の2バリエーションで出題したいという依頼を受けた。社会にはまだ出題形式が無く（`SubjectQuestionTypePolicy`の対応表が空）、小6（`Elementary6thYearEntranceExam`）のカリキュラムも1件も無い。実装前にユーザーへ4点を確認し、以下の方針で合意済み:

1. **4択の誤答**: 単語マスターと同じく、同じ単元の他の問題の解答から自動で3つ選ぶ（問題ごとに誤答データは持たない）。
2. **形式ごとの対象問題**: 穴埋め（基本チェック・ガイド）は4択と一問一答の両方で出す。記述（記述力アップ）は選択肢を作れないため一問一答だけで出し、解答例を見て自己採点する。
3. **解答の扱い**: 写真に解答が無く、mdの解答はClaudeが補ったもの（一部「要確認」）。確認を待たずにこのまま登録し、誤りが見つかったらmdとデータを直して再投入する。
4. **図つき問題**: `Question`に任意の画像URLを追加し、切り出した画像を問題と一緒に表示する。画像は音声（第15回）と同じく`public/`への同梱を暫定運用とする（`CLAUDE.md`の本来方針はCloud Storage）。

### 実装

**ドメイン層の変更**:
- `QuestionType`に`MultipleChoice`（4択）と`OneQuestionOneAnswer`（一問一答）を追加する。どちらも科目を問わない名前にするが、`SubjectQuestionTypePolicy`では当面`SocialStudies`だけに対応させる。
- `Question`に`imageUrl: string | null`を追加する（`explanation`と同じ任意項目のパターン。`QuestionProps.imageUrl?: string`）。

**コンテンツ構成**:
- 小6社会のカリキュラム`curriculum-pre-social`（`Elementary6thYearEntranceExam`／`SocialStudies`）を新設する。
- 9単元それぞれに、`MultipleChoice`と`OneQuestionOneAnswer`の`LearningUnit`を1つずつ作る（漢字の書き・読みと同じく、形式ごとに別の`LearningUnit`。計18件）。
- 1つの穴埋めに空欄が複数ある問題（例:「（①）…（②）…」、方位の❶〜❻）は、空欄ごとに別の`Question`に分ける（4択で「①守護 ②地頭」のような複合解答が混ざると選択肢が不自然になるため）。
- 問題データは`infrastructure/memory/preSocialSeedData.ts`に置き、`seedData.ts`から読み込んでFirestoreへ投入する。mdからTSへの変換には一時スクリプトを使い、リポジトリには残さない。
- 画像は`public/images/pre-social/`に置く。

**UI層**:
- `MultipleChoice`は単語マスターの4択画面（`MultipleChoiceQuizPanel`）を使う。`OneQuestionOneAnswer`は漢字「書き」のセルフ採点画面（`SelfGradedQuizPanel`）を使う。
- どちらの画面も、画像のある問題では問題文の下に画像を表示する。
- 一問一答では、記述問題の解答例も同じ流れで「正解を見る」→自己採点とする。

### テストで守る不変条件

- `SubjectQuestionTypePolicy`は`SocialStudies`に`MultipleChoice`・`OneQuestionOneAnswer`を許可し、他の科目には許可しない（例: 英語に`MultipleChoice`は付けられない）。
- `LearningUnit.create`は`SocialStudies`の単元に`MultipleChoice`・`OneQuestionOneAnswer`を付けられる。
- `Question.create`/`reconstruct`は`imageUrl`を省略すると`null`になり、指定すればその値を保持する。

## 意思決定の経緯（第18回ヒアリング: 小6社会を分野単位にまとめる）

第17回で問題集の単元ごと（9単元×2形式＝18ユニット）に登録したところ、ユーザーから「単元が細かすぎる」との指摘を受け、次のように分野単位へまとめ直した。

1. **分野の区切り**: 問題集の単元番号で、地理＝1〜11、歴史＝12〜25、公民＝26〜30、総合＝31〜35とする。
2. **ユニットの分け方**: 分野ごとに1つにまとめ、出題形式（4択／一問一答）でだけ分ける（例: 「地理（4択）」「地理（一問一答）」）。
3. **今後の追加**: 歴史など未登録の単元は、単元番号つきのデータを追加すれば、番号の範囲から該当する分野のユニットに自動で入る。問題がまだ無い分野（公民・総合）は、空のユニットが修練場に並ばないよう、データを追加した時点でユニットを作る。

ドメインモデルの変更は無く、`infrastructure/memory/preSocialSeedData.ts`のまとめ方だけを変えた（単元ごとのデータはそのまま残し、分野ごとに束ねてユニット・問題を作る）。学習ユニットIDは`unit-pre-social-{geography|history|civics|comprehensive}-{choice|recall}`。旧ユニット（`unit-pre-social-01-choice`等）と旧問題はFirestoreから削除する。

## 意思決定の経緯（第19回ヒアリング: 魔力ジェルの追加）

ユーザーから「勉強をこなすと魔力ジェルというポイントを取得できる。科目によって異なる種類のジェルを取得する」という依頼を受けた。ジェルの種類（色）は、言霊（国語）＝紅、数秘（数学）＝青、異界語（英語）＝緑、錬金（理科）＝雷の金色、地誌・歴史（社会）＝琥珀の茶をベース。実装前にユーザーへ4点を確認し、以下の方針で合意済み:

1. **獲得ルール**: 1問正解するごとに、その問題の単元が属する科目のジェルを1個獲得する。やり直し（ボーナス周回）で正解した場合も獲得する（繰り返し復習のごほうび）。不正解では獲得しない。
2. **使い道**: 今は貯めて表示するだけ。使う機能（交換など）は後で設計する。
3. **能力値との関係**: 既存の`SubjectAbility`（上限100の成長度）はそのまま残し、ジェルは上限の無いポイントとして別に持つ。
4. **色**: `CLAUDE.md`の方針どおり、デザインシステム（Advisaria Magica Academy Design System）に科目ジェルの色トークンを追加してから`tokens.css`へ反映する。

### 実装

**ドメイン層の変更**:
- 値オブジェクト`ManaGel`（科目ごとのジェル所持数）を新設する。
- `CultivationProgress`が5科目すべての`ManaGel`（初期値0）を持つ。
- `recordAttempt`の引数を`(learningUnitId, isCorrect)`から`(curriculum, learningUnit, isCorrect)`に変える。`completeLearningUnit`と同じく、単元がそのカリキュラムに属さなければ例外を投げる。
- 正解なら、理解度の記録に加えて`curriculum.subject`のジェルを1増やす。科目を集約の中で確定させ、「正解すると、その科目のジェルが必ず1増える」という不変条件を集約が守るためにこの形にする。

**ユースケース層**: `RecordAttempt`・`RecordQuizAttempts`に`LearningUnitRepository`・`CurriculumRepository`を渡し、単元とカリキュラムを引いてから`recordAttempt`を呼ぶ。`SyncQuizProgress`は既に両方を持っているので、それを使う。`GetCultivationOverview`は科目ごとのジェル数を返す。

**インフラ層**: `cultivationProgress`ドキュメントに`manaGels`（科目→個数）を追加する。既存のドキュメントに無い場合は全科目0として読む。

**UI層**: 修練場のタブの上に、5科目のジェルと所持数を表示する。デザインシステムの「Items」グループに、ユーザーが用意した魔力ジェルの瓶のスプライト（`mana-gel-<科目キー>.png`、科目キーは既存の科目アイコンと同じ`kotodama`/`suhi`/`ikaigo`/`renkin`/`chishi-rekishi`）があったため、これを`public/images/mana-gel/`に置いて瓶の画像として使う。色トークン`mana-gel-*`は瓶の液体の色から取り、デザインシステムの`tokens.json`に追加したうえで`tokens.css`に反映した（各ジェルの下線に使用）。

### テストで守る不変条件

- `initiate`された進捗は5科目すべてのジェルを0個で持つ。
- `recordAttempt`で正解すると、その単元の科目のジェルだけが1増え、他の科目のジェルは変わらない。
- `recordAttempt`で不正解なら、どの科目のジェルも変わらない。
- 同じ単元で繰り返し正解すれば、そのたびに1ずつ増える（上限は無い）。
- 単元が渡したカリキュラムに属さない場合は例外を投げ、理解度もジェルも変わらない。
- `ManaGel`の個数は0以上の整数。`add`は1以上の整数だけを受け付ける。

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

### ManaGel（新規・第19回ヒアリング）

```ts
class ManaGel {
  static none(subject: Subject): ManaGel; // count = 0 で生成
  static create(subject: Subject, count: number): ManaGel; // countが0以上の整数でなければ例外
  readonly subject: Subject;
  readonly count: number; // 0以上の整数。上限なし
  add(amount: number): ManaGel; // amountが1以上の整数でなければ例外。新しいManaGelを返す（不変）
}
```

- **不変条件**: `count` は常に0以上の整数。上限は無い（`SubjectAbility`の0〜100とは別の、貯まるポイント）。

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
  // （数学・国語の4形式は第4回・第8回ヒアリングで追加）
  "MultipleChoice",               // 4択（第17回ヒアリング。当面は社会のみ）
  "OneQuestionOneAnswer",         // 一問一答（第17回ヒアリング。当面は社会のみ）
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
      referenceText?: string; // 省略可。採点対象外の読み物・解説（第14回ヒアリングで追加）
      referenceAudioUrl?: string; // 省略可。referenceTextの聞き取り用音声URL（第15回ヒアリングで追加）
    },
    subject: Subject,
  ): LearningUnit;
  readonly id: string;
  readonly curriculumId: string;
  readonly title: string;
  readonly difficulty: number;
  readonly questionType: QuestionType | null; // 追加フィールド
  readonly referenceText: string | null; // 追加フィールド（第14回ヒアリング）
  readonly referenceAudioUrl: string | null; // 追加フィールド（第15回ヒアリング）
}
```

- **破壊的変更**: コンストラクタを `private` にし、`LearningUnit.create(props, subject)` 経由の生成に変更（`Curriculum` と同様の形）。`subject` は `questionType` のバリデーションにのみ使い、保持はしない（`subject` は `curriculumId` 経由で `Curriculum` から辿れるため、フィールドとしては重複させない）。
- **識別子**: `id`。
- `curriculumId` で所属する `Curriculum` を参照する（弱参照。現状、存在検証はドメイン層にない）。
- **不変条件**: `questionType` を指定する場合、`subject` と `questionType` の組み合わせは `SubjectQuestionTypePolicy` を満たさなければならない（下記）。満たさない場合は生成時に例外。`questionType` を省略した場合はバリデーションなしで `null` になる（既存の文法単元向けの後方互換）。
- 「不定詞」のような文法単元は `questionType = null` のまま。「単語テスト」「本文の和訳」「英訳問題」は、それぞれ `questionType` を持つ独立した `LearningUnit`（例: 同じ `curriculumId` に属するが別の `id` を持つレコード）として表現する。1つの `LearningUnit` が複数の `questionType` を持つことはない。
- `difficulty`（難易度）の値域・単位は現行コードでは未規定。本追記のスコープ外（下記「スコープ外（残課題）」参照）。
- `referenceText`（第14回ヒアリングで追加）は採点対象の`Question`ではない読み物・解説用の任意フィールドで、`questionType`の有無とは独立に持てる（両方null、両方あり、片方だけ、のいずれも許容）。バリデーションは無い（空文字も許容。表示用データのため）。

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
  get grade(): Grade; // 第3回ヒアリング分で追加。第16回ヒアリングでchangeGradeにより変更可能になった
  changeGrade(grade: Grade): void; // LAUNCHED_GRADES以外は例外。別の学年へ変えるとミッション2種をnullにする。同じ学年なら何もしない

  // 能力成長（第1回ヒアリング分、変更なし）
  getAbility(subject: Subject): SubjectAbility;
  completeLearningUnit(curriculum: Curriculum, learningUnit: LearningUnit): SubjectAbility;

  // ミッション生成（新規）
  getUnderstanding(learningUnitId: string): UnderstandingLevel; // 未記録なら UnderstandingLevel.zero(learningUnitId)
  recordAttempt(curriculum: Curriculum, learningUnit: LearningUnit, isCorrect: boolean): UnderstandingLevel; // 第19回で引数変更。正解なら科目のジェル+1
  getManaGel(subject: Subject): ManaGel; // 第19回ヒアリング
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

### 国語の出題形式（第8回ヒアリング分）のテスト不変条件 — 実装・テスト済み

- [x] `QuestionType` の妥当な値（7種、`KanjiWriting`/`KanjiReading`を含む）・`isQuestionType` の真偽判定
- [x] `subjectQuestionTypePolicy`: `Japanese` は `KanjiWriting`/`KanjiReading` の2形式でtrue
- [x] `subjectQuestionTypePolicy`: Japanese以外の科目は `KanjiWriting` を含めどの形式もfalse

### テスト受験フロー（第9回ヒアリング分）のテスト不変条件 — 実装・テスト済み

- [x] `QuizSession.start` は `currentIndex=0` で生成される
- [x] `QuizSession.start` は `totalQuestions <= 0` のとき例外を投げる
- [x] `QuizSession.advance()` は `currentIndex` を1つ進める
- [x] `QuizSession.advance()` は `isComplete` が `true` になった時点で以後の呼び出しに例外を投げる
- [x] `QuizSession.reconstruct` は永続化された `currentIndex` を再検証せずそのまま信頼する
- [x] `answerCorrectnessPolicy`: 前後の空白以外が完全一致する場合のみtrue

### テスト受験フローのバッチ化（第11回ヒアリング分）のテスト不変条件 — 実装・テスト済み

- [x] `SyncQuizProgress`: 複数件の `results` それぞれについて `recordAttempt` を呼び、該当単元の `UnderstandingLevel` をまとめて更新する
- [x] `SyncQuizProgress`: 既存の `QuizSession` があればそこから継続して `results.length` 回 `advance()` する（`0` からやり直さない）
- [x] `SyncQuizProgress`: 完了していなければ `QuizSession` を保存し、`CultivationProgress` は削除しない
- [x] `SyncQuizProgress`: 全問完了すると `completeLearningUnit`（能力成長）を呼び、`QuizSession` を削除（リセット）する
- [x] `SyncQuizProgress`: 生徒の `CultivationProgress` が存在しない場合は例外を投げる

### 漢字「書き」のセルフ採点・5問セット化（第12回ヒアリング分）のテスト不変条件 — 実装・テスト済み

- [x] `RecordQuizAttempts`: 複数件の `results` それぞれについて `recordAttempt` を呼び、該当単元の `UnderstandingLevel` をまとめて更新する
- [x] `RecordQuizAttempts`: `QuizSession` には一切触れない（本来の出題進捗を変化させない）
- [x] `RecordQuizAttempts`: 生徒の `CultivationProgress` が存在しない場合は例外を投げる

## スコープ外（残課題。本追記には含まない）

1. **`CultivationProgressRepository`（永続化）**: ドメイン層設計時点では未設計だったが、動作確認用システム構築時にインメモリ実装込みで用意した（`tasklist.md` 参照）。具象実装 `FirebaseCultivationProgressRepository` を実装済み。Firestoreの `cultivationProgress/{studentId}` コレクションに `{ grade, abilities, understandingLevels, currentDailyMission, currentMockExamMission }` の形で永続化する。復元時は `CultivationProgress.reconstruct` を使う（詳細は `tasklist.md` 7番参照）。
2. **ユースケース層（例: `CompleteLearningUnit` / `RecordAttempt` / `GenerateDailyMission`）**: 同上、動作確認用システム構築時に実装済み（`tasklist.md` 参照）。→ `CompleteLearningUnit`（単元完了ボタン用）は、実際のテスト受験フロー（`SyncQuizProgress`）が能力成長を担うようになったため、手動での自己申告的な完了操作が不要と判断し削除した（下記14番参照）。
3. **difficulty（難易度）の意味**: 現状 `number` 型のみで制約なし。値域や上昇量との連動（難易度が高いほど上昇量が大きい等）は今回採用しなかった（上昇量は固定）。将来変更する場合は改めて仕様化する。
4. **Missionの完了状態管理**: 生徒がMissionを「実施した／していない」をトラッキングする仕組み。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。既存の `recordAttempt`/`completeLearningUnit` による学習状況の追跡で十分とする。
5. **デイリーミッション・モック模試ミッションの一意性制御**: 同じ日・同じ試験に対する重複生成を防ぐ仕組み。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。何度生成しても上書きされる現在の挙動を維持する。
6. **進級（Gradeの変更）**: `CultivationProgress.initiate` で確定した `Grade` を後から変更する操作（例: セカンドグレード→サードグレードへの進級）。ヒアリングの結果、今回は不要と判断し見送った（第5回ヒアリング、`tasklist.md` 参照）。対応グレードのコンテンツ整備（次項）を優先する。
7. **First/Third/Fourth/Fifth/Sixthグレードの中身**: `Grade` 型には定義済みだが、対応する `ExamType`・`Curriculum`・`LearningUnit` はまだ無い。学年を1つ開放するごとに、`ExamType` への追加・`GradeExamTypePolicy` の `REGULAR_EXAM_TYPE_BY_GRADE` への追加・該当カリキュラムの用意が必要。ヒアリングの結果、今回は不要と判断し見送った（`README.md`/`CLAUDE.md` 記載の対応学習領域の範囲外、`tasklist.md` 参照）。
8. **大学受験（最終ゴール）**: 「シックスグレードの先にあるゴール」という位置づけのみで、型やExamTypeとしては未着手。ヒアリングの結果、今回も不要と判断し見送った（第1回ヒアリングの結論を再確認）。
9. **問題文・単語リスト・正解などのコンテンツ本体**: `QuestionType` はあくまで「出題形式の種類」という構造情報のみ。実際の単語リスト・本文・和訳/英訳の正解例などのコンテンツ本体は、`CLAUDE.md` の方針通りFirestoreに格納する想定。→ 第7回ヒアリングで`Question`エンティティとして実装済み（下記参照）。第8回ヒアリングで国語の漢字小テストI（書き56件・読み56件）、第10回ヒアリングで漢字小テストII（書き77件・読み77件）、第13回ヒアリングで英語の単語マスターI（5件、のちLesson 2全域の99件に更新）、第14回ヒアリングでLesson 2 Scene 1の本文・文法解説（`referenceText`）＋例文練習3問（`unit-english-l2-s1-practice`、`PassageTranslationToEnglish`）を追加済み。現状は数学の2ユニット・国語の4ユニット・英語の2ユニット（単語マスターI・Lesson 2 Scene 1例文練習）に実データあり。英語の本文の和訳（`PassageTranslationToJapanese`）はLearningUnitが現状存在せず引き続き対象外（将来追加する場合は同じ`Question`の仕組みで対応できる）。
10. **English以外の科目のQuestionType**: `SubjectQuestionTypePolicy` は当初 `English` のみ対応表を持っていた。他科目に出題形式を追加する場合は、改めてヒアリングのうえ `QUESTION_TYPES_BY_SUBJECT` に追加する。→ 第6回ヒアリングで `Math`（`Calculation`/`WordProblem`）、第8回ヒアリングで `Japanese`（`KanjiWriting`/`KanjiReading`）を追加済み（下記参照）。`Science`/`SocialStudies` は引き続き未対応。
11. **テスト受験フローの対象範囲**: `QuizSession` によるテスト受験フローは `questionType` を持つユニット全般に汎用的に動作するため、第10回ヒアリングで追加した漢字小テストIIにもコード変更無しでそのまま適用された。数学の計算問題・文章題への展開も同じ仕組みを流用できるが今回は未着手。
12. **学習ユニット一覧の「進行中」バッジ表示**: 中断中のテストに「進行中40%」のようなバッジを表示するアイデアは、第9回ヒアリングの結果、今回は不要と判断し見送った（任意の改善として後回し）。
13. **残りの小テスト**: 小テストIII以降は、ユーザーからデータが提供された時点で同じ手順（`KANJI_TEST_n_ITEMS`の追加）で追加する。
14. **学習ユニット一覧の手動「正解」「不正解」「単元完了」ボタンの廃止**: 実際のテスト受験フロー（「テストを受ける」＝`SyncQuizProgress`/`SelfGradedQuizPanel`）が整ったことで、生徒が問題を解かずに自己申告だけで理解度・能力値を操作できてしまう手動ボタンは不要と判断しユーザー指示により削除した。`questionType` を持つユニットは「テストを受ける」（＋「問題を見る」）のみを表示し、`questionType` を持たない（実データが無い）ユニットは「準備中」と表示するのみで、どの操作も提供しない。これに伴い `CompleteLearningUnit` ユースケース（＋テスト）を削除した。`recordAttempt`（理解度記録）は「問題を見る」内のQuizCardの自己採点（覚えた／もう一度）からは引き続き呼ばれる。
15. **英語の残り3モード（シャドーイング／文法・Speakチェック／ニガテ復習）**: 第13回ヒアリングで「単語マスター」のみ先行実装し、残りは後日改めてヒアリングのうえ着手する方針。シャドーイングは教科書音声素材の準備とブラウザの音声認識対応状況（iOS Safariの制約）、ニガテ復習は問題単位の履歴記録という新しいドメイン概念が必要になるなど、モードごとに前提条件が異なる。→ 第14回ヒアリングで「本文・翻訳トレーニング」はLesson 2 Scene 1に限り先行実装した（`referenceText`による本文・文法解説の表示＋`WordOrderQuizPanel`による例文練習）が、他のLesson・Sceneへの展開は未着手（データが提供された時点で同じ手順で追加する）。
16. **`LearningUnit.referenceText`のバリデーション**: 第14回ヒアリングで追加した任意フィールドだが、`Question.prompt`/`answer`のような「空文字なら例外」という不変条件は設けていない（採点に関わらない表示用データのため）。将来、空文字のreferenceTextを意図せず登録してしまう運用上の問題が出た場合は改めて検討する。
17. **音声コンテンツのFirebase Cloud Storage移行**: 第15回ヒアリングで追加した`referenceAudioUrl`は、本来の`CLAUDE.md`方針（音声/画像はCloud Storageに格納）ではなくNext.jsの`public/audio/`静的配信を暫定的に採用した（このプロジェクトでFirebase Storageが未セットアップだったため）。Storageを有効化した場合、既存の静的ファイルをアップロードし`referenceAudioUrl`をCloud StorageのダウンロードURLに差し替えるだけで移行できる（`LearningUnit`側のモデル・UIの実装は変更不要）。
18. **他Lesson・Sceneへの音声展開**: Lesson 2 Scene 1のみ先行実装。他のLesson・Sceneの会話文に音声を追加する場合、同じ手順（gTTSで英語セリフ部分のみを生成→`public/audio/`に配置→`referenceAudioUrl`を設定）を繰り返す。生成に使ったPythonスクリプトは一時ファイルのためリポジトリには残していない。

これらは `tasklist.md` に別タスクとして追加する。
