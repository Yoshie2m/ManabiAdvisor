# DDD 基盤タスクリスト

`glossary.md` / `specs/*.md` に明文化した内容を踏まえ、品質ゲート（`CLAUDE.md` の開発の掟）を満たすために残っている作業を整理する。これは既存コードの事後ドキュメント化に伴うギャップ出しであり、新規ビジネスルールの実装許可を意味しない。各タスクのうち「新しいドメインモデル」を伴うものは、着手前に改めて ddd-spec-guardian のフェーズ1（質問）からやり直すこと。

## 0. テスト基盤の整備（前提）

- [x] `package.json` にテストランナー（Vitest）を追加し、`npm test`（`vitest run`）/ `npm run test:watch`（`vitest`）スクリプトを用意した。`vitest.config.mts` で `@/*` エイリアスと対象パターン（`src/**/*.test.ts`）を設定済み。型チェックは引き続き `npx tsc --noEmit` を使用する。

## 1. 学舎割当コンテキスト（既存ロジックのテスト防衛）

`specs/house-assignment.md` の「テスト不変条件チェックリスト」をそのままユニットテスト化する。新規モデリングは不要、既存コードへのテスト追加のみ。

> 9番（鑑定UXの変更）により `ManaQuality` / `HouseAssignmentSpecification` / `decideHouse()` / `AssignHouse` は削除済みのため、それらに関するテスト項目はここから除外した。

- [x] `StudentId` の空文字バリデーション（`StudentId.test.ts` を新規作成）
- [x] `StudentAggregate.create(id, house)` が選んだ `house` をそのまま確定する（`StudentAggregate.test.ts`）
- [x] `EnrollStudent` ユースケースのフロー（選んだ `house` での生成、`save` 呼び出し）（`EnrollStudent.test.ts`）

## 2. 学舎割当コンテキスト（インフラ実装）✅実装済み（詳細は7番参照）

- [x] Firestore の `students` 相当のコレクション構成を確定する。
- [x] `FirebaseStudentRepository.findById` / `save` を実装する。

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
- [x] `mana-cultivation/infrastructure/memory/seedData.ts` に動作確認用の仮コンテンツ（カリキュラム5件・学習ユニット7件・次テスト1件）を用意。**本番のコンテンツ本体はFirestoreに格納する方針（`CLAUDE.md`）のため、DB連携時にこのファイルは廃止する。**（※実際には、7番でこのファイルを`scripts/seedFirestore.ts`の入力データとして再利用する形になったため、廃止はせず残している。）
- [x] `npx tsc --noEmit` / `npm test`（15ファイル・45テスト） / `npm run lint` を実行し、エラー0件を確認

### 未解決のまま残した論点（DB連携 or 本格運用前に要ヒアリング）

- [x] `difficulty`（難易度）の値域・意味、および上昇量との連動要否を確認する → 11番で実装済み（1〜5の整数レベル、能力成長量とは連動なし）
- [x] Missionの完了状態管理（やった／やっていない）の要否を確認する → ヒアリングの結果、今回は不要と判断（スコープ外のまま）。`recordAttempt`/`completeLearningUnit`による既存の学習状況追跡で十分とし、Mission自体への完了フラグは追加しない。
- [x] デイリーミッション・モック模試ミッションの一意性制御（重複生成の可否）の要否を確認する → ヒアリングの結果、今回は不要と判断（スコープ外のまま）。何度生成しても上書きされる現在の挙動を維持する。
- [x] 複数生徒・ログイン機構 → 10番でFirebase Authentication導入により解決済み

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

- [x] 進級（`Grade`の変更）を表す操作の設計 → ヒアリングの結果、今回は不要と判断（スコープ外のまま）。対応グレードのコンテンツ整備（直後の項目）を先に進める。
- [x] `First`/`Third`/`Fourth`/`Fifth`/`Sixth`グレードの`ExamType`・`Curriculum`・`LearningUnit`の用意 → ヒアリングの結果、今回は不要と判断（スコープ外のまま）。`README.md`/`CLAUDE.md`記載の「対応する学習領域」（中2定期テスト・英検・小6中学受験）の範囲外のため。
- [x] 大学受験（最終ゴール）のモデル化要否・方法 → ヒアリングの結果、今回も不要と判断（第1回ヒアリングの結論を再確認。スコープ外のまま）。

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

- [x] English以外の科目へのQuestionType追加（例: 数学の「計算問題」「文章題」） → 12番で実装済み（数学に`Calculation`/`WordProblem`を追加。他3科目は未対応のまま）
- [x] 単語リスト・本文・和訳/英訳の正解例などのコンテンツ本体の設計・Firestore格納（今回はタイトルのみのダミー） → 13番で実装済み。`Question`エンティティ＋`questions`コレクションを新設し、数学の計算問題・文章題に実データ（5件）を投入した。英語の単語テスト・和訳・英訳問題は現状対応するLearningUnitが存在しないため未投入（必要になったら同じ仕組みで追加する）。

## 7. DB連携（Firestoreコレクション構成・Firebase実装）✅コレクション確定・Firebase実装まで完了

Firebaseプロジェクト（`manabi-advisor`）・Firestoreデータベース作成後、以下のコレクション構成で確定し実装した。詳細は `specs/mana-cultivation.md` / `specs/house-assignment.md` を参照。

- [x] コレクション構成を確定（マスタデータ3種 + 生徒ごとのデータ2種）
  - `curricula/{curriculumId}`: `{ examType, subject, title }`（マスタ、生徒に依存しない）
  - `learningUnits/{learningUnitId}`: `{ curriculumId, title, difficulty, questionType }`（マスタ）
  - `upcomingExams/{examType}`: `{ id, examType, scheduledDate, targetLearningUnitIds }`（マスタ。ドキュメントIDに`examType`の値を採用。`findByExamType`が試験種別ごとに最大1件という前提のため）
  - `students/{studentId}`: `{ manaQuality: {order, chaos, amount}, house }`（学舎割当コンテキスト。※9番の鑑定UX変更により、現在は `{ house }` のみに変更されている）
  - `cultivationProgress/{studentId}`: `{ grade, abilities, understandingLevels, currentDailyMission, currentMockExamMission }`（魔力修練コンテキスト。`studentId`は学舎割当コンテキストのStudentIdを再利用）
- [x] `FirebaseStudentRepository` / `FirebaseCurriculumRepository` / `FirebaseLearningUnitRepository`（新規） / `FirebaseUpcomingExamRepository`（新規） / `FirebaseCultivationProgressRepository`（新規）を実装
- [x] 永続化のための復元ファクトリをドメイン層に追加（ビジネスルールの変更ではなく、インメモリ実装では不要だった「ドキュメント→ドメインオブジェクト」復元の技術的対応。いずれも既存の`create`相当のバリデーションを再実行しない、永続化データを信頼する設計）: `StudentAggregate.reconstruct` / `Curriculum.reconstruct` / `LearningUnit.reconstruct` / `Mission.reconstruct` / `CultivationProgress.reconstruct`。`StudentAggregate.manaQuality` / `CultivationProgress.getUnderstandingLevels()` ゲッターも追加（永続化のためのシリアライズに必要）。
- [x] Firestoreセキュリティルールを更新・デプロイ（マスタ3コレクションは読み取り公開・書き込み拒否、`students`/`cultivationProgress`は認証機構が無いため一時的に読み書き公開。認証導入後に`request.auth.uid == studentId`へ絞る必要あり）
- [x] `npx tsc --noEmit` / `npm test`（22ファイル・84テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

- [x] `useAcademyStore.ts` のComposition Root部分を `infrastructure/firebase/` の実装に切り替えた。InMemory実装（`InMemoryStudentRepository` 等5ファイル）はどこからも参照されなくなったため削除した。
- [x] `scripts/seedFirestore.ts` を新規作成し、`infrastructure/memory/seedData.ts`（5カリキュラム・43学習ユニット・1次テスト）をFirestoreに投入した（`npm run seed`）。投入時のみ`firestore.rules`のマスタ3コレクションの書き込みを一時的に許可→投入後に元の拒否設定へ戻してデプロイ済み。`seedData.ts`自体はこのスクリプトの入力データとして残す。
- [x] 開発サーバー・Firestoreへの読み取りクエリで、Firebase実装への切り替えが実際に動作することを確認した。

- [x] Firebase Authentication導入、およびそれに伴う `students` / `cultivationProgress` のセキュリティルール強化 → 10番で実施済み。

## 8. 学園案内コンテキスト（回帰防止）

- [ ] `data-theme` 属性への書き込みが `ThemeProvider.tsx` 以外に存在しないことを確認する lint ルール or CI チェックの検討（任意）。

## 9. 学舎割当コンテキスト（鑑定UXの変更: 数値入力→選択制）✅実装済み

`specs/house-assignment.md` の「意思決定の経緯（第2回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/ManaQuality.ts` を削除した
- [x] `domain/specs/HouseAssignmentSpecification.ts` を削除した
- [x] `domain/models/Student.ts` を更新（`manaQuality` を削除、`house: House` を必須の構築時パラメータに変更、`assignTo` を削除）
- [x] `domain/models/StudentAggregate.ts` を更新（`create(id, house)` に変更、`decideHouse()` / `reconstruct` / `manaQuality` ゲッターを削除）＋ `StudentAggregate.test.ts` を更新
- [x] `usecase/AssignHouse/` を削除した
- [x] `usecase/EnrollStudent/EnrollStudent.ts` を更新（`execute(studentId, house)` に変更）＋ `EnrollStudent.test.ts` を更新
- [x] `infrastructure/firebase/FirebaseStudentRepository.ts` を更新（Firestoreドキュメントを `{ house }` のみに変更、`manaQuality` フィールドを廃止）
- [x] `src/stores/useAcademyStore.ts` を更新（`enroll` が `manaQuality` の代わりに選ばれた `house` を受け取るように変更、`AssignHouse` usecaseの呼び出しを削除）
- [x] `src/app/page.tsx` を更新（秩序度・混沌度・魔力量のスライダーを削除し、各学舎の特性を選択肢として提示するUIに変更）
- [x] `README.md` / `CLAUDE.md` の該当箇所を更新
- [x] `npx tsc --noEmit` / `npm test`（22ファイル・83テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 10. Firebase Authentication導入（複数生徒対応）✅実装済み

`glossary.md` の「認証について」節でヒアリング済み。方針: メール/パスワード認証、`StudentId = Firebase Authのuid`、ログイン後は既存`StudentAggregate`の有無で分岐。新しいドメインモデルは伴わない（`StudentId`の型・不変条件は変更なし）ため、`specs/*.md` への新規仕様追加はせず、本タスクリストのみで進めた。

- [x] Firebaseコンソールで Authentication の「メール/パスワード」プロバイダを有効化した
- [x] `src/lib/auth.ts` を新規作成（`watchAuthState`、`signUp`、`signIn`、`signOutUser` の薄いラッパー）
- [x] `src/stores/useAcademyStore.ts` を更新:
  - [x] 固定の `DEMO_STUDENT_ID` を削除し、認証中の `uid` から都度 `StudentId` を導出する（`currentStudentId`）
  - [x] `authUid` / `isAuthLoading` 状態を追加
  - [x] `initialize()` アクションを追加（`watchAuthState` を購読し、ログイン中なら `studentRepository.findById` で既存登録の有無を確認して `house` / `isEnrolled` / `overview` を復元、未ログインなら全状態をリセット）
  - [x] `signUp` / `signIn` / `signOutUser` アクションを追加
- [x] `src/components/AuthInitializer.tsx` を新規作成し、`src/app/layout.tsx` に配置した
- [x] `src/app/page.tsx` を更新: 未ログイン時はログイン/サインアップフォーム、ログイン済み・未登録なら学舎選択、ログイン済み・登録済みなら修練場への案内を表示する3分岐にした
- [x] `firestore.rules` を更新・デプロイ: `students/{studentId}` / `cultivationProgress/{studentId}` を `allow read, write: if request.auth != null && request.auth.uid == studentId;` に変更
- [x] `firebase/auth` のサインアップ/ログインをNodeスクリプトで動作確認、Cloudflare Workers上（`wrangler dev`）でもエラー無く200応答することを確認した（`firebase/firestore`と異なり`firebase/auth`はprotobufjsのcodegenに依存せず、`/lite`への切り替えは不要だった）
- [x] `npx tsc --noEmit` / `npm test`（22ファイル・83テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 11. 魔力修練コンテキスト（Difficulty値オブジェクトの追加）✅実装済み

`specs/mana-cultivation.md` の「意思決定の経緯（第5回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/Difficulty.ts` を新規作成（`DIFFICULTIES` 定数5値・`Difficulty`型・`isDifficulty`）＋テスト
- [x] `domain/models/LearningUnit.ts` を更新（`difficulty: number` → `difficulty: Difficulty` に変更、`create()` で範囲外なら例外を投げる）＋テスト更新
- [x] `infrastructure/firebase/FirebaseLearningUnitRepository.ts` のドキュメント型を更新
- [x] `usecase/GetCultivationOverview/GetCultivationOverview.ts` の `LearningUnitView` に `difficulty` を追加
- [x] `src/app/academy/page.tsx` の学習ユニット一覧に難易度（★表示）を追加
- [x] `npx tsc --noEmit` / `npm test`（23ファイル・95テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 12. 魔力修練コンテキスト（数学のQuestionType追加）✅実装済み

`specs/mana-cultivation.md` の「意思決定の経緯（第6回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/QuestionType.ts` に `Calculation`（計算問題）・`WordProblem`（文章題）を追加 ＋ テスト更新
- [x] `domain/specs/SubjectQuestionTypePolicy.ts` の対応表に `Math: ["Calculation", "WordProblem"]` を追加 ＋ テスト追加
- [x] `infrastructure/memory/seedData.ts` に数学の出題形式別ユニットを2件追加（`unit-math-calc-1` / `unit-math-word-1`）し、`npm run seed` でFirestoreに再投入（一時的に書き込みを許可→投入後に元の拒否設定へ戻してデプロイ済み）
- [x] `src/app/academy/page.tsx` の `QUESTION_TYPE_LABEL` に日本語ラベルを追加
- [x] `npx tsc --noEmit` / `npm test`（23ファイル・99テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 13. 魔力修練コンテキスト（コンテンツ本体: Question）✅実装済み

`specs/mana-cultivation.md` の「意思決定の経緯（第7回ヒアリング）」節でヒアリング済み。

- [x] `domain/models/Question.ts` を新規作成（`create`/`reconstruct`、prompt/answerの空文字バリデーション）＋テスト
- [x] `domain/repositories/QuestionRepository.ts` を新規作成（`findByLearningUnitId`）
- [x] `infrastructure/firebase/FirebaseQuestionRepository.ts` を新規作成（Firestoreの `questions` コレクション）
- [x] `usecase/GetQuestionsForLearningUnit/GetQuestionsForLearningUnit.ts` を新規作成 ＋ テスト
- [x] `infrastructure/memory/seedData.ts` に数学の実問題5件（計算問題3件・文章題2件）を追加し、`scripts/seedFirestore.ts` 経由で `npm run seed` でFirestoreに投入（一時的に書き込みを許可→投入後に元の拒否設定へ戻してデプロイ済み）
- [x] `firestore.rules` に `questions` コレクションの読み取り公開・書き込み拒否ルールを追加・デプロイ
- [x] `src/stores/useAcademyStore.ts` に `fetchQuestions` アクションを追加（Composition Rootに `FirebaseQuestionRepository` / `GetQuestionsForLearningUnit` を追加）
- [x] `src/app/academy/page.tsx` に「問題を見る」ボタン（`LearningUnitRow` コンポーネント）を追加し、クリックで問題文・正解を表示
- [x] Firestoreへの直接クエリで実データの読み取りを確認
- [x] `npx tsc --noEmit` / `npm test`（25ファイル・104テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 14. 学園案内コンテキスト（修練場の3タブ構成への再編）✅実装済み

ユーザーから画面レイアウト案（大広間・魔導書庫・幻影の塔）のペーストを受け、スコープをヒアリング済み。方針: タブ構成・属性の呼称（命名）は全面導入、「教科書設定」は見送り、「幻影の塔」は既存`UnderstandingLevel`から導出する簡易版。新しいドメインモデルは伴わない（`attemptCount`フィールド追加のみ）ため、`specs/*.md`への新規仕様追加はせず本タスクリストのみで進めた。

- [x] `GetCultivationOverview`の`LearningUnitView`に`attemptCount`（試行回数）を追加（「一度も挑んでいない」と「挑んで理解度が低い」を区別するため）
- [x] `src/app/academy/page.tsx`を3タブ構成に再編
  - 大広間: 既存デイリーミッション・既存UpcomingExamを使った試験カウントダウン（残り日数に応じて枠の発光が強まる。`prefers-reduced-motion`では停止）・予想問題ミッション
  - 魔導書庫: 5属性（言霊/数秘/異界語/錬金/地誌歴史）の選択→その科目の能力値・学習ユニット一覧（既存データのみ、教科書設定は無し）
  - 幻影の塔: 全属性/属性別フィルタ、`attemptCount > 0 かつ understandingRate < 60` を「ニガテの幻影」として表示。正答で理解度が上がれば一覧から自然に消える（新しい永続状態は持たない）
- [x] `docs/domain/glossary.md`にタブ構成・属性呼称・ニガテ/浄化のUI概念を追記
- [x] `npx tsc --noEmit` / `npm test`（25ファイル・104テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 15. 学園案内コンテキスト（デザインシステムのTabBar/SubjectIcons適用）✅実装済み

デザインシステムに追加された`TabBar`・`SubjectIcons`（`TabIcon`）コンポーネント仕様（README.md/preview.html/bundle.js/bundle.css/assets/Icons/README.md）を移植。

- [x] `src/components/ui/TabIcon.tsx` を新規作成（24×24グリッドの線画ピクトグラム8種: タブ3種＋教科5種。パスデータはデザインシステムの`bundle.js`から移植）
- [x] `src/components/ui/TabBar.tsx` を新規作成（`value`/`defaultValue`/`onChange`・`badges`対応。寮ごとの選択マーク演出は`globals.css`に追加）
- [x] `src/app/academy/page.tsx` の自作タブ切り替え・絵文字を`TabBar`/`TabIcon`に置き換え。タブidを`hall`/`library`/`tower`（デザインシステムの既定値）に統一し、幻影の塔タブに残ニガテ数のバッジを表示
- [x] `docs/domain/glossary.md`に`TabIcon`/`TabBar`を追記
- [x] `npx tsc --noEmit` / `npm test`（25ファイル・104テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 16. 魔力修練コンテキスト（漢字小テストIの追加）✅実装済み

ユーザー提供ファイル（`kanji_test_01_final.txt`、「漢字テスト（第一回）」56問）を「中2の漢字小テストI」として登録。`specs/mana-cultivation.md` の「意思決定の経緯（第8回ヒアリング）」節でヒアリング済み。残りの小テストII・IIIは別途データが提供された時点で後日追加する（本タスクのスコープ外）。

- [x] `domain/models/QuestionType.ts` に `KanjiWriting`（漢字の書き）・`KanjiReading`（漢字の読み）を追加 ＋ テスト更新
- [x] `domain/specs/SubjectQuestionTypePolicy.ts` の対応表に `Japanese: ["KanjiWriting", "KanjiReading"]` を追加 ＋ テスト追加
- [x] ソースファイルの56問について、問題文中のカタカナ区間が読みの正解と一致することを確認し、読み（ふりがな）データを機械的に導出（新規の知識生成ではない）。実装前に全56件の導出結果をユーザーに提示し承認を得た
- [x] `infrastructure/memory/seedData.ts` に国語の出題形式別ユニットを2件追加（`unit-japanese-kanji-test1-write` / `unit-japanese-kanji-test1-read`）、`Question` を112件追加（書き56件・読み56件）し、`npm run seed` でFirestoreに再投入（一時的に書き込みを許可→投入後に元の拒否設定へ戻してデプロイ済み）
- [x] `src/app/academy/page.tsx` の `QUESTION_TYPE_LABEL` に日本語ラベルを追加し、`QUESTION_TYPE_TO_QUIZ_KIND` を `QUIZ_CARD_PRESET_BY_QUESTION_TYPE` に拡張（国語向けの章名・指示文・言語設定をQuestionTypeごとに上書き）
- [x] Firestoreへの直接クエリで書き・読み各56件の実データの読み取りを確認
- [x] `npx tsc --noEmit` / `npm test`（26ファイル・113テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 17. 魔力修練コンテキスト（テスト受験フロー・QuizSessionの追加）✅実装済み

ユーザーから画面構成案（進捗バー・入力欄・中断時の再開ダイアログ・オートセーブ）のペーストを受け、スコープをヒアリング済み。`specs/mana-cultivation.md` の「意思決定の経緯（第9回ヒアリング）」節を参照。対象は「漢字小テストI」の2ユニットのみ、一覧画面の進行中バッジ表示は見送り。

- [x] `domain/specs/AnswerCorrectnessPolicy.ts` を新規作成（前後の空白のみ許容した完全一致判定）＋テスト
- [x] `domain/models/QuizSession.ts` を新規作成（`start`/`reconstruct`、`currentIndex`/`isComplete`/`progressRatio`、`advance()`）＋テスト
- [x] `domain/repositories/QuizSessionRepository.ts` を新規作成（`find`/`save`/`delete`）
- [x] `usecase/FindQuizSession/FindQuizSession.ts`・`usecase/StartQuiz/StartQuiz.ts`・`usecase/SubmitQuizAnswer/SubmitQuizAnswer.ts` を新規作成（`SubmitQuizAnswer`は正誤判定→`recordAttempt`→セッション進行・保存→完了時は`completeLearningUnit`＋セッション削除、まで一貫して行う）＋テスト（フェイクリポジトリ）
- [x] `infrastructure/firebase/FirebaseQuizSessionRepository.ts` を新規作成。Firestoreの `quizSessions/{studentId}/units/{learningUnitId}` サブコレクションに永続化
- [x] `firestore.rules` に `quizSessions/{studentId}/units/{learningUnitId}` の読み書きルール（`request.auth.uid == studentId`）を追加
- [x] `src/stores/useAcademyStore.ts` に `checkQuizSession`/`startQuizSession`/`submitQuizAnswerFor` アクションを追加（Composition Rootに `FirebaseQuizSessionRepository` と3ユースケースを追加）。`fetchQuestions` は問題IDの昇順ソートを追加（クイズの出題順を安定させるため）
- [x] `src/app/academy/page.tsx` に「テストを受ける」ボタンと `QuizTakingPanel` コンポーネントを追加（進捗バー・カタカナ/熟語の強調表示・入力欄・正誤フィードバック・中断時の再開ダイアログ「続きから／最初からやり直す」・完了時の結果画面）。既存の読み取り専用「問題を見る」ボタンは変更せず共存させる
- [x] `docs/domain/glossary.md`に`QuizSession`/`AnswerCorrectnessPolicy`/テスト受験フローを追記
- [x] `npx tsc --noEmit` / `npm test`（29ファイル・128テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

### バグ修正: 二重送信による正誤表示のずれ

ユーザーからスクリーンショット付きで報告: 問題文（例: 「携帯」）は正しく表示されているのに、不正解時の「正解: ○○」が別の問題（1つ前の問題）の答えになっているように見える不具合。

原因: `QuizTakingPanel`の「答える」ボタンが送信中（`submitQuizAnswerFor`のネットワーク待ち）も無効化されておらず、素早い連打（特にモバイルのダブルタップ）で同一問題に対する送信が2回同時に走っていた。1回目のレスポンスで次の問題に進んだ後、2回目（古い問題を指したまま）のレスポンスが遅れて返り、`setFeedback`で新しい問題の表示に古い問題の正解を上書きしてしまっていた（`QuizSession.advance()`も二重に呼ばれ、セッションの`currentIndex`が1問分余計に進んでしまう副作用もあった）。

- [x] `isSubmitting` 状態を追加し、`submitAnswer()` 内で送信中の再入をブロック（ガード節＋`finally`で確実に解除）
- [x] 「答える」ボタンを送信中は`disabled`にし、ラベルを「送信中…」に変更
- [x] `npx tsc --noEmit` / `npm test`（29ファイル・128テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 18. 魔力修練コンテキスト（漢字小テストIIの追加）✅実装済み

ユーザー提供ファイル（`kanji_test_02.txt`、「漢字テスト（第二回）」77問）を「中2の漢字小テストII」として登録。`specs/mana-cultivation.md` の「意思決定の経緯（第10回ヒアリング）」節を参照。小テストIと異なり、ソースのカタカナ7問分が熟語の正しい読みと一致していなかったため、該当問題はユーザー確認のうえ熟語の標準的な読みを採用した（書きテストの問題文はソースのまま変更していない）。

- [x] `infrastructure/memory/seedData.ts` に国語の出題形式別ユニットを2件追加（`unit-japanese-kanji-test2-write` / `unit-japanese-kanji-test2-read`）、`KANJI_TEST_2_ITEMS`（77件）から `Question` を154件（書き77件・読み77件）生成して追加
- [x] 77問全件についてカタカナ区間と解答（熟語）の読みの整合性をスクリプトで突き合わせ、不一致の7問（2, 7, 16, 23, 30, 31, 33番）を特定してユーザーに提示・対応方針を確認
- [x] `npm run seed` でFirestoreに再投入（一時的に書き込みを許可→投入後に元の拒否設定へ戻してデプロイ済み）
- [x] Node上で `seedData.ts` を直接読み込み、新ユニット2件・`Question`154件が例外なく生成されることを確認
- [x] 既存の「テストを受ける」機能（17番）は `questionType` ベースの汎用実装のため、コード変更無しで小テストIIにもそのまま適用されることを確認
- [x] `docs/domain/specs/mana-cultivation.md`に第10回ヒアリング節を追記
- [x] `npx tsc --noEmit` / `npm test`（29ファイル・128テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 19. 魔力修練コンテキスト（テスト受験フローのバッチ化）✅実装済み

漢字小テストのように問題数が多い（56〜77問）場合、1問ごとにサーバーへ送信する従来方式（17番で実装した`SubmitQuizAnswer`）は通信待ちが積み重なりユーザビリティが低いとユーザーから指摘。`specs/mana-cultivation.md` の「意思決定の経緯（第11回ヒアリング）」節でヒアリング済み。全問のデータは元々テスト開始時に一括ダウンロード済みだったため、正誤判定をクライアント側に移し、サーバー同期を「完了時」「中断して閉じる時」のみに限定する方針で合意（予期せぬ終了時の未同期分の消失は許容）。

- [x] `usecase/SubmitQuizAnswer/`（1問ごとの判定・同期）を削除し、`usecase/SyncQuizProgress/SyncQuizProgress.ts` を新規作成（複数問分の結果をまとめて`recordAttempt`→既存`QuizSession`から継続して`advance()`を結果件数分呼ぶ→完了時は`completeLearningUnit`＋セッション削除、未完了ならセッション保存）＋テスト（フェイクリポジトリ、既存セッションからの継続ケースを含む）
- [x] `src/stores/useAcademyStore.ts` の `submitQuizAnswerFor` を `syncQuizProgressFor` に置き換え
- [x] `src/app/academy/page.tsx` の `QuizTakingPanel` を全面改修: 正誤判定を`answerCorrectnessPolicy`でクライアント側即時実行（通信待ちゼロ）、結果は`useRef`で端末内に蓄積、最終問題到達時または「◀ 戻る」クリック時にのみ`syncQuizProgressFor`でまとめて同期。二重タップガードもネットワーク非依存の同期的な`ref`ガードに変更
- [x] `docs/domain/glossary.md`・`docs/domain/specs/mana-cultivation.md`（第11回ヒアリング節、`SubmitQuizAnswer`→`SyncQuizProgress`への置き換えとして型定義を更新）を更新
- [x] `npx tsc --noEmit` / `npm test`（29ファイル・127テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 20. 学園案内コンテキスト（漢字「書き」のセルフ採点・5問セット化）✅実装済み

漢字の「書き」テストは手書きで確認するため解答欄に入力させる方式が不向きで、かつ56〜77問を一度に進めるのはユーザビリティが低いとユーザーから画面構成案のペーストを受けてヒアリング。`specs/mana-cultivation.md` の「意思決定の経緯（第12回ヒアリング）」節を参照。対象は`KanjiWriting`のみ、`KanjiReading`等は19番で実装したテキスト入力＋全問一括のフローを維持。

- [x] `usecase/RecordQuizAttempts/RecordQuizAttempts.ts` を新規作成（「もう一度この5問」「間違えた問題だけやり直す」用。`recordAttempt`のみ行い`QuizSession`には触れない）＋テスト
- [x] `src/stores/useAcademyStore.ts` に `recordQuizAttemptsFor` アクションを追加
- [x] `src/app/academy/page.tsx`: クイズ起動処理（全問先読み・中断セッション確認・新規開始）を`useQuizBootstrap`フックに抽出し、`QuizTakingPanel`（テキスト入力式）と新設の`SelfGradedQuizPanel`（`KanjiWriting`専用）で共有
- [x] `SelfGradedQuizPanel` を新規作成: 「正解を見る」→自己採点（正解/不正解）の2ステップ、5問（`SELF_GRADED_SET_SIZE`）ごとに`syncQuizProgressFor`でまとめて同期、セット完了時に`SetReviewList`（正誤一覧）付きの結果画面を表示
- [x] 結果画面に「次の5問に進む」「間違えた問題だけをやり直す」「もう一度この5問を解く」「テスト選択へ戻る」を実装。後者2つのやり直しは`recordQuizAttemptsFor`のみを呼び、本来の出題進捗（`QuizSession`）には影響させない
- [x] `LearningUnitRow` で `unit.questionType === "KanjiWriting"` のとき `SelfGradedQuizPanel` を、それ以外は従来の `QuizTakingPanel` を表示するよう分岐
- [x] リファクタに伴うESLintエラー（エフェクト内での同期的setState）を修正し、二重タップ・同期失敗時のガード（`finally`でのref解除、送信中のボタン無効化）を追加
- [x] `docs/domain/glossary.md`・`docs/domain/specs/mana-cultivation.md`（第12回ヒアリング節）を更新
- [x] `npx tsc --noEmit` / `npm test`（30ファイル・129テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認

## 21. 学園案内コンテキスト（手動の正解・不正解・単元完了ボタンの廃止）✅実装済み

実際のテスト受験フロー（「テストを受ける」）が整ったため、問題を解かずに自己申告だけで理解度・能力値を操作できてしまう手動ボタンは不要とユーザーから指示。`specs/mana-cultivation.md` の「スコープ外」14番を参照。

- [x] `src/app/academy/page.tsx` の `LearningUnitRow` から「正解」「不正解」「単元完了 (+5)」ボタンを削除。`questionType` を持たない（実データが無い）ユニットには「準備中」バッジを表示するのみに変更
- [x] `LibraryTab`/`TowerTab`/`AcademyPage` から不要になった `onComplete` の受け渡しを削除（`onRecordAttempt` は「問題を見る」内のQuizCardの自己採点から引き続き使うため維持）
- [x] `src/stores/useAcademyStore.ts` から `completeUnit` アクションと `CompleteLearningUnit` の呼び出しを削除
- [x] `usecase/CompleteLearningUnit/`（usecase本体＋テスト）を削除（呼び出し元が無くなったため）
- [x] `docs/domain/glossary.md`・`docs/domain/specs/mana-cultivation.md`を更新
- [x] `npx tsc --noEmit` / `npm test`（29ファイル・126テスト） / `npm run lint` / `npm run build` を実行し、エラー0件を確認
