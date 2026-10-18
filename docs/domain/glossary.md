# ユビキタス言語 用語集 (Ubiquitous Language Glossary)

本ドキュメントは、各境界づけられたコンテキストで使われるビジネス用語とその意味を定義する。実装（型・変数・関数名）はここで定義した用語に一致させること。新しい用語を追加・変更する場合は、まずこのファイルを更新してから実装に反映する。

対象コンテキストの全体像は `CLAUDE.md` / `README.md` を参照。

---

## 1. 学舎割当コンテキスト (House Assignment Context)

中心ドメイン。生徒の入学時に、各学舎の特性を提示したうえで、生徒自身がどちらの学舎に入りたいかを選択する。

> **変更履歴**: 初版では「魔力資質（ManaQuality）を数値で入力し、`HouseAssignmentSpecification` が自動判定する」という仕様だったが、「数値入力ではなく、各学舎の特性を選択肢として提示し、生徒自身が選ぶ」方式への変更をヒアリングのうえ決定した（詳細は `specs/house-assignment.md` 参照）。これに伴い `ManaQuality` と `HouseAssignmentSpecification` は廃止した。生徒が選んだ学舎は常にそのまま確定し、人数上限などの例外条件は無い。

| 用語 | 分類 | 定義 | 実装 |
|---|---|---|---|
| **Student（生徒）** | エンティティ | 一意の識別子と、入学時に自ら選んだ配属学舎を持つ生徒本体。学舎は生成時に必ず確定しており、`null` になることはない。 | `domain/models/Student.ts` |
| **StudentId（生徒ID）** | 値オブジェクト | 生徒を一意に識別する不変の文字列ID。空文字は許容しない。 | `domain/models/StudentId.ts` |
| **House（学舎）** | 値オブジェクト | 生徒の配属先を表す列挙値。`RegiusCardis`（レギウス・カルディス）または `RoseSleep`（ローズスリープ）のいずれか。 | `domain/models/House.ts` |
| **RegiusCardis（レギウス・カルディス）** | Houseの値 | 規律正しさを特性とする学舎。生徒がこの特性を気に入って選んだ場合に配属される（判定条件はない）。 | `domain/models/House.ts` |
| **RoseSleep（ローズスリープ）** | Houseの値 | ミステリアスな個性を伸ばすことを特性とする学舎。生徒がこの特性を気に入って選んだ場合に配属される（判定条件はない）。 | `domain/models/House.ts` |
| **StudentAggregate（生徒集約）** | 集約ルート | `Student` エンティティをルートとする境界。生徒が選んだ学舎をそのまま確定させて生成する。 | `domain/models/StudentAggregate.ts` |
| **StudentRepository（生徒リポジトリ）** | リポジトリ（インターフェース） | `StudentAggregate` の永続化を抽象化する境界。ID検索 (`findById`) と保存 (`save`) を提供。 | `domain/repositories/StudentRepository.ts` |
| **EnrollStudent（入学ユースケース）** | ユースケース | 生徒ID・選んだ学舎を受け取り、生徒を選んだ学舎で確定させて保存するアプリケーションサービス。 | `usecase/EnrollStudent/EnrollStudent.ts` |

---

## 2. 魔力修練コンテキスト (Mana Cultivation Context)

配属後の生徒の魔力パラメータの成長と、修練（学習）の進捗管理を司る。学年・試験種別ごとに異なるカリキュラムの多様性を、コンテキストを分けずにこのモデリングで吸収する方針（`CLAUDE.md` 参照）。

| 用語 | 分類 | 定義 | 実装 |
|---|---|---|---|
| **ExamType（試験種別）** | 値オブジェクト | 対応する学習領域を表す列挙値。`JuniorHigh2ndYearRegularExam`（中学2年生の定期テスト）・`Eiken`（英検）・`Elementary6thYearEntranceExam`（小学6年生の中学受験）のいずれか。 | `domain/models/ExamType.ts` |
| **Grade（学年段階）** | 値オブジェクト | 中1〜高3を貫く7段階の学年進行。`Pre`（プレ期間／小6、入学前の準備期間）・`First`（ファーストグレード／中1）・`Second`（セカンドグレード／中2）・`Third`（サードグレード／中3）・`Fourth`（フォースグレード／高1）・`Fifth`（フィフスグレード／高2）・`Sixth`（シックスグレード／高3）のいずれか。シックスグレードの先に「大学受験」という最終ゴールがあるが、大学受験自体は未モデル化（`specs/mana-cultivation.md` 参照）。 | `domain/models/Grade.ts` |
| **LAUNCHED_GRADES（提供中の学年段階）** | ドメイン定数 | `Grade` のうち、対応する `ExamType`（定期テスト系）がすでに存在し、鑑定画面で選択可能な学年段階の一覧。現時点では `Pre` と `Second` の2つのみ。 | `domain/specs/GradeExamTypePolicy.ts` |
| **GradeExamTypePolicy（学年別試験種別ポリシー）** | 仕様（ポリシー） | ある `Grade` に対して、生徒が受ける可能性のある `ExamType` 群を返す純粋なドメインルール。`Pre`→`Elementary6thYearEntranceExam`、`Second`→`JuniorHigh2ndYearRegularExam`のように定期テスト系ExamTypeを1つ返し、さらに学年を問わず`Eiken`を常に含める。対応する定期テスト系ExamTypeがまだ無い学年（`First`/`Third`/`Fourth`/`Fifth`/`Sixth`）は`Eiken`のみを返す。 | `domain/specs/GradeExamTypePolicy.ts` |
| **Subject（科目）** | 値オブジェクト | 主要5科目を表す列挙値。`English`（英語）・`Math`（数学）・`Japanese`（国語）・`Science`（理科）・`SocialStudies`（社会）のいずれか。 | `domain/models/Subject.ts` |
| **ExamTypeごとの対象科目** | ドメインルール | どの `ExamType` がどの `Subject` の組み合わせを持つかを定めるマッピング。`JuniorHigh2ndYearRegularExam` は5科目全て、`Eiken` は `English` のみ、`Elementary6thYearEntranceExam` は `English` を除く4科目（`Japanese`/`Math`/`Science`/`SocialStudies`）。 | `domain/specs/CurriculumSubjectSpecification.ts` |
| **CurriculumSubjectSpecification（カリキュラム科目仕様）** | 仕様 | ある `ExamType` と `Subject` の組み合わせが実在しうるか（上記マッピングに合致するか）を判定する純粋なドメインルール。 | `domain/specs/CurriculumSubjectSpecification.ts` |
| **Curriculum（カリキュラム）** | エンティティ | ある `ExamType` ・ `Subject` の組に紐づく学習プログラムの単位。`id` で一意に識別され、タイトルを持つ。生成時に `CurriculumSubjectSpecification` を満たさない組み合わせ（例: 英検×理科）は拒否される。 | `domain/models/Curriculum.ts` |
| **QuestionType（出題形式）** | 値オブジェクト | 学習ユニットの出題形式を表す列挙値。全科目共通で使える仕組みだが、現時点では英語向けの3種類（`VocabularyTest`＝単語テスト、`PassageTranslationToJapanese`＝本文の和訳、`PassageTranslationToEnglish`＝英訳問題）のみ定義済み。他科目向けの形式は未定義。 | `domain/models/QuestionType.ts` |
| **SubjectQuestionTypePolicy（科目別出題形式ポリシー）** | 仕様（ポリシー） | ある `Subject` がどの `QuestionType` をサポートするかを判定する純粋なドメインルール。現時点では `English` のみ3形式に対応し、他科目は対応表が空（＝どの `QuestionType` も許可しない）。 | `domain/specs/SubjectQuestionTypePolicy.ts` |
| **LearningUnit（学習ユニット）** | エンティティ | ある `Curriculum` に属する学習範囲の最小単位。`id` で一意に識別され、所属カリキュラムID・タイトル・難易度（`difficulty`）・出題形式（`questionType`、省略可）を持つ。`questionType` を指定する場合は `SubjectQuestionTypePolicy` を満たさなければならない（例: 数学に `VocabularyTest` は付けられない）。「不定詞」のような通常の文法単元は `questionType = null` のまま、「単語テスト」「本文の和訳」「英訳問題」は `questionType` を持つ独立した `LearningUnit` として表現する（文法単元に紐づく形式バリエーションではない）。 | `domain/models/LearningUnit.ts` |
| **CurriculumRepository（カリキュラムリポジトリ）** | リポジトリ（インターフェース） | `ExamType` に応じた `Curriculum` 一覧の取得を抽象化する境界。 | `domain/repositories/CurriculumRepository.ts` |
| **SubjectAbility（科目別能力）** | 値オブジェクト | 生徒が持つ、ある1科目についての習熟度を表す不変オブジェクト。`subject` と `level`（0〜100）からなる。`increase(amount)` は上限100でクランプした新しい `SubjectAbility` を返す。 | `domain/models/SubjectAbility.ts` |
| **UnderstandingLevel（単元理解度）** | 値オブジェクト | 生徒が持つ、ある1 `LearningUnit` についての理解度を表す不変オブジェクト。`correctCount`（正解数）・`totalCount`（試行数）からなり、`rate`（正答率、0〜100。未試行は0）を算出する。`recordAttempt(isCorrect)` は正誤を1件記録した新しい `UnderstandingLevel` を返す。 | `domain/models/UnderstandingLevel.ts` |
| **UpcomingExam（次のテスト）** | エンティティ | ある `ExamType` について次に実施される試験と、その出題範囲（対象 `LearningUnit` のID群）を表す。生徒個人にではなく、`ExamType` 単位で共有される情報。 | `domain/models/UpcomingExam.ts` |
| **Mission（ミッション）** | エンティティ | 生徒に提示される学習タスク。`type` が `"Daily"`（デイリーミッション）または `"MockExam"`（次テスト範囲の予想問題ミッション）のいずれかで、対象 `LearningUnit` のID群（`targetLearningUnitIds`）を持つ。`Daily` は常に1件、`MockExam` は `UpcomingExam` の出題範囲と一致する1件以上。 | `domain/models/Mission.ts` |
| **FocusUnitSelectionPolicy（重点単元選定ポリシー）** | 仕様（ポリシー） | 出題範囲の `LearningUnit` 群と、それぞれの `UnderstandingLevel` から、最も理解度が低い1単元を選び出す純粋なドメインルール。デイリーミッションの対象単元決定に使う。 | `domain/specs/FocusUnitSelectionPolicy.ts` |
| **CultivationProgress（修練進捗）** | 集約ルート | 1人の生徒（`StudentId`）の修練状態をまとめて保護する境界。(0) 所属する `Grade`、(1) 5科目すべての `SubjectAbility`、(2) 試行済み `LearningUnit` ごとの `UnderstandingLevel`、(3) 現在のデイリーミッションおよびモック模試ミッション、を保持する。`Grade` は `initiate` 時に確定し、以後変更する操作はまだ無い（進級の表現は未着手、下記「残課題」参照）。 | `domain/models/CultivationProgress.ts` |
| **学習ユニット完了による能力成長（completeLearningUnit）** | ドメイン操作 | `CultivationProgress` が、完了した `LearningUnit` とその所属 `Curriculum` を受け取り、`Curriculum.subject` に対応する `SubjectAbility` を一定量（`LEARNING_UNIT_COMPLETION_GAIN`）上昇させるふるまい。他の科目には影響しない。同一の `LearningUnit` を再度完了した場合も、その都度上昇する（上限100まで）。 | `CultivationProgress.completeLearningUnit()` |
| **問題の正誤記録（recordAttempt）** | ドメイン操作 | `CultivationProgress` が、解答した `LearningUnit` のIDと正誤を受け取り、該当単元の `UnderstandingLevel` のみを更新するふるまい。`completeLearningUnit`（能力成長）とは独立した別操作。 | `CultivationProgress.recordAttempt()` |
| **デイリーミッション付与（assignDailyMission）** | ドメイン操作 | `CultivationProgress` が、`UpcomingExam`（出題範囲）と `FocusUnitSelectionPolicy` を使って理解度最低の1単元を選び、`type="Daily"` の `Mission` を生成して保持するふるまい。 | `CultivationProgress.assignDailyMission()` |
| **モック模試ミッション提示（offerMockExamMission）** | ドメイン操作 | `CultivationProgress` が、`UpcomingExam` の出題範囲全体を対象とする `type="MockExam"` の `Mission` を生成して保持するふるまい。生徒はこのミッションを選択して挑戦できる。 | `CultivationProgress.offerMockExamMission()` |

> **残課題**: `CultivationProgress` / `UpcomingExam` / `Mission` の永続化（リポジトリ）、およびアプリケーション層からのトリガー（ユースケース）は、ドメイン層の設計時点では含まれていなかったが、後続の「動作確認用システム」構築時にインメモリ実装込みで用意した（`tasklist.md` を参照）。一方、`Grade`（学年段階）の進級（例: セカンドグレード→サードグレード）を表す操作はまだ無く、`CultivationProgress.initiate` 時に確定した `Grade` は不変のまま。進級機能は別途ヒアリングのうえ設計する。

---

## 3. 学園案内コンテキスト (Academy Guide Context / UI)

デザインシステムそのもの。学舎割当コンテキストの判定結果に応じて、UIの色彩・フォント・装飾を動的に切り替えるプレゼンテーション層。ビジネスルールを持たないため、エンティティ・値オブジェクト・集約・仕様といった戦術的パターンの対象外（詳細は `CLAUDE.md` のデザインシステム連携セクションを参照）。

| 用語 | 分類 | 定義 | 実装 |
|---|---|---|---|
| **ThemeProvider（テーマプロバイダ）** | プレゼンテーション層コンポーネント | `House` 値オブジェクトの値を `data-theme` DOM属性に変換する、ドメイン出力とDOMを繋ぐ唯一の場所。 | `components/theme/ThemeProvider.tsx` |
| **意味トークン（Semantic Tokens）** | デザインシステム概念 | `house-bg` / `house-text` / `house-primary` / `house-on-primary` / `house-accent` / `house-focus` のこと。学舎ごとの実色（`color-regius-*` / `color-rose-*`）を抽象化する。 | `styles/tokens.css` |
| **GrimoireCard（魔導書風カード）** | UIコンポーネント | デザインシステム仕様に基づくカードコンポーネント。 | `components/ui/GrimoireCard.tsx` |
| **MagicalToggle（魔法トグル）** | UIコンポーネント | デザインシステム仕様に基づくトグルスイッチコンポーネント。 | `components/ui/MagicalToggle.tsx` |

---

## 更新履歴

- 初版作成: 既存実装（学舎割当・魔力修練・学園案内の各コンテキスト）から逆引きで用語を整理。新規ビジネスルールの追加ではないため、フェーズ1の質問は発生していない。
- 追記: 魔力修練コンテキストに「主要5科目の学習による能力成長」ルールを追加（`Subject` / `SubjectAbility` / `CultivationProgress` / `CurriculumSubjectSpecification`）。ユーザーへのヒアリングにより、(1) 科目はExamTypeごとに異なる、(2) 能力値は科目ごとに独立、(3) 学舎割当コンテキストのManaQualityとは別概念、(4) LearningUnit完了ごとに固定量上昇・上限100・再完了も毎回カウント、という方針を確認済み。詳細は `specs/mana-cultivation.md` を参照。
  - **設計判断（要確認）**: `CultivationProgress` の識別子には、学舎割当コンテキストの `StudentId`（`domain/models/StudentId.ts`）をそのまま再利用する。StudentIdは外部依存を持たない値オブジェクトであり、同一生徒を指す識別子をコンテキード間で共有すること自体は許容されるという判断だが、厳密にはコンテキスト間の型依存にあたるため、気になる場合は魔力修練コンテキスト独自のID型に分離することも可能（`specs/mana-cultivation.md` 参照）。
- 追記: 魔力修練コンテキストに `Grade`（学年段階）を追加。中1〜高3を貫く7段階（`Pre`〜`Sixth`）のうち、現時点で選択可能なのは `Pre`（プレ期間/小6）と `Second`（セカンドグレード/中2）の2つ（`LAUNCHED_GRADES`）。ユーザーへのヒアリングにより、(1) Gradeは学舎割当ロジックには影響しない、(2) 1つのGradeにつき定期テスト系ExamTypeが1つ対応し英検は全Grade共通、(3) Grade型自体は将来の7値すべてを先に定義する、(4) 大学受験は今回モデル化しない、という方針を確認済み。`CultivationProgress.initiate` が `grade` を必須パラメータとして受け取るようになった（既存の呼び出し箇所もすべて更新）。詳細は `specs/mana-cultivation.md` を参照。
- 追記: 魔力修練コンテキストに「過去の間違い問題から単元理解度を算出し、次のテスト範囲からデイリーミッションを生成する。また次テスト範囲の予想問題ミッションを選択できる」ルールを追加（`UnderstandingLevel` / `UpcomingExam` / `Mission` / `FocusUnitSelectionPolicy`）。ユーザーへのヒアリングにより、(1) 理解度は正答率でそのまま算出、(2) UpcomingExamは今回エンティティとしてモデル化し生徒個人ではなくExamType単位の共有情報とする、(3) デイリーミッションは1日1件・1単元、(4) DailyミッションとMockExamミッションは共通Mission型のtypeで区別、(5) recordAttempt（正誤記録）はcompleteLearningUnit（能力成長）とは別メソッド、(6) UnderstandingLevelとMissionは既存のCultivationProgress集約に含める、という方針を確認済み。詳細は `specs/mana-cultivation.md` を参照。
- 追記: 魔力修練コンテキストに `QuestionType`（出題形式）／`SubjectQuestionTypePolicy` を追加し、`LearningUnit` に `questionType`（省略可）フィールドを追加。ユーザーへのヒアリングにより、(1) 単語テスト・和訳・英訳は既存の文法単元（例:「不定詞」）とは独立した別の `LearningUnit` として表現する、(2) `QuestionType` の仕組みは全科目共通の汎用設計とする（現時点では英語の3形式のみ定義）、(3) 既存の `completeLearningUnit`/`recordAttempt` の仕組みをそのまま使い、出題形式ごとの成長・記録ロジックは追加しない、という方針を確認済み。`LearningUnit` の生成は `private constructor` + `static create(props, subject)` に変更（破壊的変更、既存の呼び出し箇所もすべて更新）。詳細は `specs/mana-cultivation.md` を参照。
