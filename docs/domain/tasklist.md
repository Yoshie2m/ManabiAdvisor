# DDD 基盤タスクリスト

`glossary.md` / `specs/*.md` に明文化した内容を踏まえ、品質ゲート（`CLAUDE.md` の開発の掟）を満たすために残っている作業を整理する。これは既存コードの事後ドキュメント化に伴うギャップ出しであり、新規ビジネスルールの実装許可を意味しない。各タスクのうち「新しいドメインモデル」を伴うものは、着手前に改めて ddd-spec-guardian のフェーズ1（質問）からやり直すこと。

## 0. テスト基盤の整備（前提）

- [x] `package.json` にテストランナー（Vitest）を追加し、`npm test`（`vitest run`）/ `npm run test:watch`（`vitest`）スクリプトを用意した。`vitest.config.mts` で `@/*` エイリアスと対象パターン（`src/**/*.test.ts`）を設定済み。型チェックは引き続き `npx tsc --noEmit` を使用する。

## 1. 学舎割当コンテキスト（既存ロジックのテスト防衛）

`specs/house-assignment.md` の「テスト不変条件チェックリスト」をそのままユニットテスト化する。新規モデリングは不要、既存コードへのテスト追加のみ。

- [ ] `ManaQuality` の生成バリデーション（範囲外で例外・境界値で成功）
- [ ] `StudentId` の空文字バリデーション
- [ ] `HouseAssignmentSpecification`（`regiusCardisSpecification` / `roseSleepSpecification`）の判定網羅性・排他性
- [ ] `StudentAggregate.decideHouse()` の状態遷移（未配属→配属済み）
- [ ] `AssignHouse` ユースケースのフロー（Not Found時の例外、成功時の `save` 呼び出し）

## 2. 学舎割当コンテキスト（インフラ実装）

- [ ] Firestore の `students` / `manaQualities` 相当のコレクション構成を確定する。
- [ ] `FirebaseStudentRepository.findById` / `save` を実装する。

## 3. 魔力修練コンテキスト（主要5科目による能力成長・ドメイン層）✅実装済み

`specs/mana-cultivation.md` の「意思決定の経緯」節でヒアリング済み。以下はTDD実装チェックリスト（仕様書の「テスト不変条件チェックリスト」と対応）。

- [x] `domain/models/Subject.ts` を新規作成（`SUBJECTS` 定数・`Subject`型・`isSubject`）
- [x] `domain/specs/CurriculumSubjectSpecification.ts` を新規作成（`SUBJECTS_BY_EXAM_TYPE` マッピングと `isSatisfiedBy`）＋テスト
- [x] `domain/models/Curriculum.ts` を更新（`subject`フィールド追加、`private constructor` + `static create`化、`CurriculumSubjectSpecification`によるバリデーション）＋テスト
- [x] `domain/models/SubjectAbility.ts` を新規作成（`initial` / `create` / `increase`、0〜100クランプ）＋テスト
- [x] `domain/models/CultivationProgress.ts` を新規作成（`initiate` / `getAbility` / `completeLearningUnit`、不変条件1〜4）＋テスト
- [x] `npx tsc --noEmit` と `npm test` を実行し、エラー0件・全テストパスを確認する

## 3b. 魔力修練コンテキスト（ミッション生成・ドメイン層）✅実装済み

`specs/mana-cultivation.md` の「意思決定の経緯（第2回ヒアリング）」節でヒアリング済み。3番と合わせて実装。

- [x] `domain/models/UnderstandingLevel.ts` を新規作成（`zero` / `create` / `rate` / `recordAttempt`、不変条件）＋テスト
- [x] `domain/models/UpcomingExam.ts` を新規作成（`targetLearningUnitIds`非空の不変条件）＋テスト
- [x] `domain/models/Mission.ts` を新規作成（`assignDaily` / `offerMockExam`、type別の不変条件）＋テスト。**実装時の簡略化**: 仕様書案にあった `assignDaily` の `assignedDate` 引数は、どの不変条件にも使われず未使用パラメータになるため実装では削除した（「1日1件」の意味は `CultivationProgress` が「現在のデイリーミッション」を1つだけ保持する形で表現）。
- [x] `domain/specs/FocusUnitSelectionPolicy.ts` を新規作成（`lowestUnderstandingRateFirstPolicy`）＋テスト
- [x] `domain/models/CultivationProgress.ts` を拡張（`recordAttempt` / `assignDailyMission` / `offerMockExamMission` / 各getter、不変条件5〜8）＋テスト
- [x] `npx tsc --noEmit` と `npm test` を実行し、エラー0件・全テストパスを確認する（37テスト全てパス）

## 4. 魔力修練コンテキスト（ユースケース・リポジトリ層）✅動作確認用に実装済み（インメモリ）

「フロントエンドだけで動く動作確認用システム」を作るにあたり、以下を実装した。DB（Firebase）には未接続で、すべてインメモリ実装。

- [x] `domain/repositories/LearningUnitRepository.ts` を新規作成（`findById` / `findByCurriculumId`）
- [x] `domain/repositories/UpcomingExamRepository.ts` を新規作成（`findByExamType`）
- [x] `domain/repositories/CultivationProgressRepository.ts` を新規作成（`findByStudentId` / `save`）
- [x] `domain/repositories/CurriculumRepository.ts` に `findById` を追加（`FirebaseCurriculumRepository` のスタブも追随）
- [x] ユースケース新規作成（すべてテスト付き）: `house-assignment/usecase/EnrollStudent`、`mana-cultivation/usecase/{CompleteLearningUnit, RecordAttempt, GenerateDailyMission, OfferMockExamMission, GetCultivationOverview}`
- [x] `infrastructure/memory/` にインメモリRepository実装を追加（`InMemoryStudentRepository` / `InMemoryCurriculumRepository` / `InMemoryLearningUnitRepository` / `InMemoryUpcomingExamRepository` / `InMemoryCultivationProgressRepository`）。**DB連携時はこれらをFirebase実装に差し替えるだけでよい設計**（usecaseはリポジトリの interface にのみ依存）。
- [x] `mana-cultivation/infrastructure/memory/seedData.ts` に動作確認用の仮コンテンツ（カリキュラム5件・学習ユニット7件・次テスト1件）を用意。**本番のコンテンツ本体はFirestoreに格納する方針（`CLAUDE.md`）のため、DB連携時にこのファイルは廃止する。**
- [x] `npx tsc --noEmit` / `npm test`（15ファイル・45テスト） / `npm run lint` を実行し、エラー0件を確認

### 未解決のまま残した論点（DB連携 or 本格運用前に要ヒアリング）

- [ ] `difficulty`（難易度）の値域・意味、および上昇量との連動要否を確認する
- [ ] Missionの完了状態管理（やった／やっていない）の要否を確認する
- [ ] デイリーミッション・モック模試ミッションの一意性制御（重複生成の可否）の要否を確認する
- [ ] 複数生徒・ログイン機構（現状は固定デモ生徒IDの単一ユーザー動作）

## 5. フロントエンドUI（動作確認用）✅実装済み

- [x] `src/stores/useAcademyStore.ts`（Zustand）でユースケース一式を配線（Composition Root）。`ドメインモデルをプレゼンテーション層へ射影する`方針（`CLAUDE.md`）に対応。
- [x] `src/app/page.tsx`: 魔力資質（秩序度・混沌度・魔力量）と学年段階（Grade）を入力して学舎を鑑定するフォームに更新
- [x] `src/app/academy/page.tsx`: 科目別能力バー・デイリーミッション／モック模試ミッション・学習ユニット一覧（正解/不正解記録・単元完了ボタン）を表示する修練場画面を新規作成
- [x] ユーザー自身によるブラウザでの動作確認。セカンドグレードで鑑定→学舎割当→デイリーミッション生成→単元完了までの一連の流れをOK確認済み（本セッションにはブラウザ操作ツールが無いため、動作確認はユーザー実施）。

## 6. 魔力修練コンテキスト（学年段階モデル）✅実装済み

「魔力資質の鑑定」でプレ期間（小6）／セカンドグレード（中2）を選べるようにする要望を受け、`specs/mana-cultivation.md` の「意思決定の経緯（第3回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/Grade.ts` を新規作成（`GRADES` 定数7値・`Grade`型・`isGrade`）＋テスト
- [x] `domain/specs/GradeExamTypePolicy.ts` を新規作成（`REGULAR_EXAM_TYPE_BY_GRADE` マッピング・`availableExamTypesFor`・`LAUNCHED_GRADES`）＋テスト
- [x] `domain/models/CultivationProgress.ts` を更新（`grade: Grade` フィールド追加、`initiate(studentId, grade)` に変更）＋既存テスト更新
- [x] `usecase/StartCultivation` を新規作成（`CultivationProgress.initiate` を呼び保存するユースケース）＋テスト
- [x] `usecase/{CompleteLearningUnit, RecordAttempt, GenerateDailyMission, OfferMockExamMission, GetCultivationOverview}` を更新: `CultivationProgress` が存在しない場合は例外を投げる方式に変更（以前の「無ければその場でinitiate」は、`grade`が無いと初期化できなくなったため廃止）。`GenerateDailyMission`/`OfferMockExamMission`/`GetCultivationOverview` は `examType` 引数を廃止し、`progress.grade` から `GradeExamTypePolicy` 経由で導出する方式に変更＋テスト更新
- [x] `src/app/page.tsx` に学年段階の選択UI（`LAUNCHED_GRADES` から生成）を追加、`enroll` 実行時に `StartCultivation` も呼ぶよう `useAcademyStore` を更新
- [x] `src/app/academy/page.tsx` に現在の学年段階を表示
- [x] `npx tsc --noEmit` / `npm test`（18ファイル・64テスト） / `npm run lint` を実行し、エラー0件を確認

### 未解決のまま残した論点（別途ヒアリングが必要）

- [ ] 進級（`Grade`の変更）を表す操作の設計
- [ ] `First`/`Third`/`Fourth`/`Fifth`/`Sixth`グレードの`ExamType`・`Curriculum`・`LearningUnit`の用意
- [ ] 大学受験（最終ゴール）のモデル化要否・方法

## 6b. 魔力修練コンテキスト（英語の出題形式モデル）✅実装済み

「英語に単語テストと本文の和訳、英訳問題を入れたい」という要望を受け、`specs/mana-cultivation.md` の「意思決定の経緯（第4回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/QuestionType.ts` を新規作成（`QUESTION_TYPES` 定数3値・`QuestionType`型・`isQuestionType`）＋テスト
- [x] `domain/specs/SubjectQuestionTypePolicy.ts` を新規作成（`QUESTION_TYPES_BY_SUBJECT` 対応表・`isSatisfiedBy`。現時点はEnglishのみ対応）＋テスト
- [x] `domain/models/LearningUnit.ts` を更新（`questionType?: QuestionType` フィールド追加、`private constructor` + `static create(props, subject)` 化、`SubjectQuestionTypePolicy`によるバリデーション）＋テスト更新
- [x] `infrastructure/memory/seedData.ts` に英語の新規学習ユニット3件（単語テスト・本文の和訳・英訳問題）を追加し、次テストの出題範囲にも含めた
- [x] `usecase/GetCultivationOverview` の `LearningUnitView` に `questionType` を追加
- [x] `src/app/academy/page.tsx` に出題形式のバッジ表示を追加
- [x] `npx tsc --noEmit` / `npm test`（21ファイル・74テスト） / `npm run lint` を実行し、エラー0件を確認

### 未解決のまま残した論点（別途ヒアリングが必要）

- [ ] English以外の科目へのQuestionType追加（例: 数学の「計算問題」「文章題」）
- [ ] 単語リスト・本文・和訳/英訳の正解例などのコンテンツ本体の設計・Firestore格納（今回はタイトルのみのダミー）

## 7. DB連携（次のフェーズ）

- [ ] Firestore の `students` / `manaQualities` / `curricula` / `learningUnits` 相当のコレクション構成を確定する。
- [ ] `FirebaseStudentRepository` / `FirebaseCurriculumRepository` を実装し、`infrastructure/memory/` の実装から差し替える（`LearningUnitRepository` / `UpcomingExamRepository` / `CultivationProgressRepository` のFirebase実装も新規に必要）。
- [ ] `useAcademyStore.ts` のComposition Root部分をFirebase実装に切り替える。

## 8. 学園案内コンテキスト（回帰防止）

- [ ] `data-theme` 属性への書き込みが `ThemeProvider.tsx` 以外に存在しないことを確認する lint ルール or CI チェックの検討（任意）。
