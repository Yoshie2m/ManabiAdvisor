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
| **StudentId（生徒ID）** | 値オブジェクト | 生徒を一意に識別する不変の文字列ID。空文字は許容しない。**Firebase Authenticationの導入により、この値はFirebase Authのuidと一致させる**（`StudentId.fromString(authUser.uid)`）。生徒IDとAuthユーザーの対応表のような別マッピングは持たない。型・不変条件そのものに変更はない。 | `domain/models/StudentId.ts` |
| **House（学舎）** | 値オブジェクト | 生徒の配属先を表す列挙値。`RegiusCardis`（レギウス・カルディス）または `RoseSleep`（ローズスリープ）のいずれか。 | `domain/models/House.ts` |
| **RegiusCardis（レギウス・カルディス）** | Houseの値 | 規律正しさを特性とする学舎。生徒がこの特性を気に入って選んだ場合に配属される（判定条件はない）。 | `domain/models/House.ts` |
| **RoseSleep（ローズスリープ）** | Houseの値 | ミステリアスな個性を伸ばすことを特性とする学舎。生徒がこの特性を気に入って選んだ場合に配属される（判定条件はない）。 | `domain/models/House.ts` |
| **StudentAggregate（生徒集約）** | 集約ルート | `Student` エンティティをルートとする境界。生徒が選んだ学舎をそのまま確定させて生成する。 | `domain/models/StudentAggregate.ts` |
| **StudentRepository（生徒リポジトリ）** | リポジトリ（インターフェース） | `StudentAggregate` の永続化を抽象化する境界。ID検索 (`findById`) と保存 (`save`) を提供。 | `domain/repositories/StudentRepository.ts` |
| **EnrollStudent（入学ユースケース）** | ユースケース | 生徒ID・選んだ学舎を受け取り、生徒を選んだ学舎で確定させて保存するアプリケーションサービス。 | `usecase/EnrollStudent/EnrollStudent.ts` |

> **認証について**: ログイン・サインアップ（Firebase Authentication）自体は、どの境界づけられたコンテキストにも属さないビジネスルールを持たない技術的関心事として扱う。`src/lib/auth.ts` に薄いラッパーを置き、プレゼンテーション層（`useAcademyStore.ts` / `src/app/page.tsx`）がそこから得た `uid` を `StudentId` に変換してドメイン層・ユースケース層へ渡す。ドメイン層（`StudentId` 自体の型定義など）には一切変更を加えない。

---

## 2. 魔力修練コンテキスト (Mana Cultivation Context)

配属後の生徒の魔力パラメータの成長と、修練（学習）の進捗管理を司る。学年・試験種別ごとに異なるカリキュラムの多様性を、コンテキストを分けずにこのモデリングで吸収する方針（`CLAUDE.md` 参照）。

| 用語 | 分類 | 定義 | 実装 |
|---|---|---|---|
| **ExamType（試験種別）** | 値オブジェクト | 対応する学習領域を表す列挙値。`JuniorHigh2ndYearRegularExam`（中学2年生の定期テスト）・`Eiken`（英検）・`Elementary6thYearEntranceExam`（小学6年生の中学受験）のいずれか。 | `domain/models/ExamType.ts` |
| **Grade（学年段階）** | 値オブジェクト | 中1〜高3を貫く7段階の学年進行。`Pre`（プレ期間／小6、入学前の準備期間）・`First`（ファーストグレード／中1）・`Second`（セカンドグレード／中2）・`Third`（サードグレード／中3）・`Fourth`（フォースグレード／高1）・`Fifth`（フィフスグレード／高2）・`Sixth`（シックスグレード／高3）のいずれか。シックスグレードの先に「大学受験」という最終ゴールがあるが、大学受験自体は未モデル化（`specs/mana-cultivation.md` 参照）。 | `domain/models/Grade.ts` |
| **LAUNCHED_GRADES（提供中の学年段階）** | ドメイン定数 | `Grade` のうち、対応する `ExamType`（定期テスト系）がすでに存在し、鑑定画面で選択可能な学年段階の一覧。現時点では `Pre` と `Second` の2つのみ。入学時の選択に加え、入学後の学年切り替え（`CultivationProgress.changeGrade`）もこの範囲に限られる。 | `domain/specs/GradeExamTypePolicy.ts` |
| **GradeExamTypePolicy（学年別試験種別ポリシー）** | 仕様（ポリシー） | ある `Grade` に対して、生徒が受ける可能性のある `ExamType` 群を返す純粋なドメインルール。`Pre`→`Elementary6thYearEntranceExam`、`Second`→`JuniorHigh2ndYearRegularExam`のように定期テスト系ExamTypeを1つ返し、さらに学年を問わず`Eiken`を常に含める。対応する定期テスト系ExamTypeがまだ無い学年（`First`/`Third`/`Fourth`/`Fifth`/`Sixth`）は`Eiken`のみを返す。 | `domain/specs/GradeExamTypePolicy.ts` |
| **Subject（科目）** | 値オブジェクト | 主要5科目を表す列挙値。`English`（英語）・`Math`（数学）・`Japanese`（国語）・`Science`（理科）・`SocialStudies`（社会）のいずれか。 | `domain/models/Subject.ts` |
| **ExamTypeごとの対象科目** | ドメインルール | どの `ExamType` がどの `Subject` の組み合わせを持つかを定めるマッピング。`JuniorHigh2ndYearRegularExam` は5科目全て、`Eiken` は `English` のみ、`Elementary6thYearEntranceExam` は `English` を除く4科目（`Japanese`/`Math`/`Science`/`SocialStudies`）。 | `domain/specs/CurriculumSubjectSpecification.ts` |
| **CurriculumSubjectSpecification（カリキュラム科目仕様）** | 仕様 | ある `ExamType` と `Subject` の組み合わせが実在しうるか（上記マッピングに合致するか）を判定する純粋なドメインルール。 | `domain/specs/CurriculumSubjectSpecification.ts` |
| **Curriculum（カリキュラム）** | エンティティ | ある `ExamType` ・ `Subject` の組に紐づく学習プログラムの単位。`id` で一意に識別され、タイトルを持つ。生成時に `CurriculumSubjectSpecification` を満たさない組み合わせ（例: 英検×理科）は拒否される。 | `domain/models/Curriculum.ts` |
| **QuestionType（出題形式）** | 値オブジェクト | 学習ユニットの出題形式を表す列挙値。全科目共通で使える仕組み。英語向け3種類（`VocabularyTest`＝単語テスト、`PassageTranslationToJapanese`＝本文の和訳、`PassageTranslationToEnglish`＝英訳問題）、数学向け2種類（`Calculation`＝計算、`WordProblem`＝文章題）、国語向け2種類（`KanjiWriting`＝漢字の書き、`KanjiReading`＝漢字の読み）の合計7種類を定義済み。他科目向けの形式は未定義。 | `domain/models/QuestionType.ts` |
| **SubjectQuestionTypePolicy（科目別出題形式ポリシー）** | 仕様（ポリシー） | ある `Subject` がどの `QuestionType` をサポートするかを判定する純粋なドメインルール。`English`は3形式、`Math`は2形式、`Japanese`は2形式（`KanjiWriting`/`KanjiReading`）に対応し、他科目は対応表が空（＝どの `QuestionType` も許可しない）。 | `domain/specs/SubjectQuestionTypePolicy.ts` |
| **Difficulty（難易度）** | 値オブジェクト | `LearningUnit` の難易度を表す1〜5の整数レベル（1が最も易しく、5が最も難しい）。`DIFFICULTIES` 定数5値・`Difficulty`型・`isDifficulty` 真偽判定を持つ。能力成長量（`LEARNING_UNIT_COMPLETION_GAIN`）とは連動させない（表示用の指標として独立させる方針を確認済み）。 | `domain/models/Difficulty.ts` |
| **LearningUnit（学習ユニット）** | エンティティ | ある `Curriculum` に属する学習範囲の最小単位。`id` で一意に識別され、所属カリキュラムID・タイトル・難易度（`difficulty: Difficulty`）・出題形式（`questionType`、省略可）を持つ。`difficulty` が1〜5の範囲外の場合、生成時に例外を投げる。`questionType` を指定する場合は `SubjectQuestionTypePolicy` を満たさなければならない（例: 数学に `VocabularyTest` は付けられない）。「不定詞」のような通常の文法単元は `questionType = null` のまま、「単語テスト」「本文の和訳」「英訳問題」は `questionType` を持つ独立した `LearningUnit` として表現する（文法単元に紐づく形式バリエーションではない）。 | `domain/models/LearningUnit.ts` |
| **Question（問題）** | エンティティ | ある `LearningUnit` に属する、問題文（`prompt`）と正解例（`answer`）を1組持つ学習コンテンツ本体。`id` で一意に識別され、空文字の `prompt`/`answer` は許容しない。`LearningUnit`（構造）とは別のFirestoreコレクション（`questions`）に格納し、1つの `LearningUnit` に0件以上の `Question` が属する。 | `domain/models/Question.ts` |
| **CurriculumRepository（カリキュラムリポジトリ）** | リポジトリ（インターフェース） | `ExamType` に応じた `Curriculum` 一覧の取得を抽象化する境界。 | `domain/repositories/CurriculumRepository.ts` |
| **SubjectAbility（科目別能力）** | 値オブジェクト | 生徒が持つ、ある1科目についての習熟度を表す不変オブジェクト。`subject` と `level`（0〜100）からなる。`increase(amount)` は上限100でクランプした新しい `SubjectAbility` を返す。 | `domain/models/SubjectAbility.ts` |
| **UnderstandingLevel（単元理解度）** | 値オブジェクト | 生徒が持つ、ある1 `LearningUnit` についての理解度を表す不変オブジェクト。`correctCount`（正解数）・`totalCount`（試行数）からなり、`rate`（正答率、0〜100。未試行は0）を算出する。`recordAttempt(isCorrect)` は正誤を1件記録した新しい `UnderstandingLevel` を返す。 | `domain/models/UnderstandingLevel.ts` |
| **UpcomingExam（次のテスト）** | エンティティ | ある `ExamType` について次に実施される試験と、その出題範囲（対象 `LearningUnit` のID群）を表す。生徒個人にではなく、`ExamType` 単位で共有される情報。 | `domain/models/UpcomingExam.ts` |
| **Mission（ミッション）** | エンティティ | 生徒に提示される学習タスク。`type` が `"Daily"`（デイリーミッション）または `"MockExam"`（次テスト範囲の予想問題ミッション）のいずれかで、対象 `LearningUnit` のID群（`targetLearningUnitIds`）を持つ。`Daily` は常に1件、`MockExam` は `UpcomingExam` の出題範囲と一致する1件以上。 | `domain/models/Mission.ts` |
| **FocusUnitSelectionPolicy（重点単元選定ポリシー）** | 仕様（ポリシー） | 出題範囲の `LearningUnit` 群と、それぞれの `UnderstandingLevel` から、最も理解度が低い1単元を選び出す純粋なドメインルール。デイリーミッションの対象単元決定に使う。 | `domain/specs/FocusUnitSelectionPolicy.ts` |
| **CultivationProgress（修練進捗）** | 集約ルート | 1人の生徒（`StudentId`）の修練状態をまとめて保護する境界。(0) 所属する `Grade`、(1) 5科目すべての `SubjectAbility`、(2) 試行済み `LearningUnit` ごとの `UnderstandingLevel`、(3) 現在のデイリーミッションおよびモック模試ミッション、を保持する。`Grade` は `initiate` 時に決まり、入学後は `changeGrade` で `LAUNCHED_GRADES` の範囲内に切り替えられる（切り替えると現在のミッション2種は取り消され、能力値と単元ごとの理解度は残る。第16回ヒアリング）。 | `domain/models/CultivationProgress.ts` |
| **学習ユニット完了による能力成長（completeLearningUnit）** | ドメイン操作 | `CultivationProgress` が、完了した `LearningUnit` とその所属 `Curriculum` を受け取り、`Curriculum.subject` に対応する `SubjectAbility` を一定量（`LEARNING_UNIT_COMPLETION_GAIN`）上昇させるふるまい。他の科目には影響しない。同一の `LearningUnit` を再度完了した場合も、その都度上昇する（上限100まで）。 | `CultivationProgress.completeLearningUnit()` |
| **問題の正誤記録（recordAttempt）** | ドメイン操作 | `CultivationProgress` が、解答した `LearningUnit` のIDと正誤を受け取り、該当単元の `UnderstandingLevel` のみを更新するふるまい。`completeLearningUnit`（能力成長）とは独立した別操作。 | `CultivationProgress.recordAttempt()` |
| **デイリーミッション付与（assignDailyMission）** | ドメイン操作 | `CultivationProgress` が、`UpcomingExam`（出題範囲）と `FocusUnitSelectionPolicy` を使って理解度最低の1単元を選び、`type="Daily"` の `Mission` を生成して保持するふるまい。 | `CultivationProgress.assignDailyMission()` |
| **モック模試ミッション提示（offerMockExamMission）** | ドメイン操作 | `CultivationProgress` が、`UpcomingExam` の出題範囲全体を対象とする `type="MockExam"` の `Mission` を生成して保持するふるまい。生徒はこのミッションを選択して挑戦できる。 | `CultivationProgress.offerMockExamMission()` |
| **QuizSession（テスト受験セッション）** | エンティティ（集約ルート） | ある生徒（`StudentId`）がある `LearningUnit` のテストに挑戦している最中の中断可能な進捗を表す。`totalQuestions`（全問題数）・`currentIndex`（次に解答する問題の0始まりの位置）を持ち、`advance()` で1問分進む（完了済みなら例外）。`CultivationProgress` とは別の集約として独立させた（第9回ヒアリング）。 | `domain/models/QuizSession.ts` |
| **AnswerCorrectnessPolicy（解答正誤判定ポリシー）** | 仕様（ポリシー） | 生徒が入力した解答と正解を、前後の空白のみ許容した完全一致で判定する純粋なドメインルール。 | `domain/specs/AnswerCorrectnessPolicy.ts` |
| **テスト受験フロー（SyncQuizProgress）** | ユースケース | テスト受験中の正誤判定はクライアント側（UI層から`AnswerCorrectnessPolicy`を直接呼ぶ）で行い、端末内に結果を蓄積する。サーバーへの同期は「テスト完了時」または「中断して閉じる」時のみ、まとめて1回行う（1問ごとの通信を避けるため。第11回ヒアリングで旧`SubmitQuizAnswer`から置き換え）。複数件の結果を`recordAttempt`（理解度記録）でまとめて記録し、`QuizSession.advance()`を結果件数分呼んだ上で保存。全問完了していれば`completeLearningUnit`（能力成長）を呼び`QuizSession`を削除する（＝「1回解ききるまで保持し、解ききったらリセット」）。ブラウザが予期せず閉じられた場合、未同期分の進捗は失われる仕様（ヒアリング済み）。`KanjiWriting`（漢字の書き）のみ、5問セットの区切りで同期するよう呼び出し頻度が変わる（第12回ヒアリング、下記参照）。 | `usecase/SyncQuizProgress/SyncQuizProgress.ts` |
| **漢字「書き」のセルフ採点UI（SelfGradedQuizPanel）** | UIコンポーネント | `KanjiWriting`専用のクイズ画面。解答欄を持たず「正解を見る」→生徒自身が「正解（覚えた！）／不正解（もう一度）」を選ぶセルフ採点形式。5問を1セットとし、セットの区切りで`SyncQuizProgress`を呼ぶ（`KanjiReading`等の他QuestionTypeは引き続きテキスト入力＋自動採点・全問一括のまま）。セット完了ごとに正誤一覧の結果画面を表示し、「間違えた問題だけをやり直す」「もう一度この5問を解く」というボーナス周回を提供する（第12回ヒアリング）。 | `src/app/academy/page.tsx` |
| **RecordQuizAttempts（ボーナス周回の記録）** | ユースケース | 「間違えた問題だけをやり直す」「もう一度この5問を解く」のような、本来の出題進捗とは無関係な追加練習の結果を記録する。`recordAttempt`（理解度記録）のみを行い、`QuizSession`（出題進捗）には一切触れない（第12回ヒアリング）。 | `usecase/RecordQuizAttempts/RecordQuizAttempts.ts` |
| **学習ユニット一覧の操作（手動ボタンの廃止）** | UI方針 | `LearningUnitRow` は、`questionType` を持つ（＝実データのある）ユニットには「テストを受ける」「問題を見る」のみを表示する。`questionType` を持たない（実データが無い）ユニットは「準備中」と表示し、どの操作も提供しない。以前あった手動の「正解」「不正解」「単元完了」ボタン（自己申告だけで理解度・能力値を操作できてしまう仕組み）はユーザー指示により廃止し、`CompleteLearningUnit` ユースケースは削除した。 | `src/app/academy/page.tsx` |
| **単語マスター（MultipleChoiceQuizPanel）** | UIコンポーネント | `VocabularyTest`専用のクイズ画面。訳語の表現ブレが大きく自由記述の自動採点に向かないため4択形式を採る。誤答選択肢は同一学習ユニット内の他の単語の訳をUI側で流用して生成する（`buildChoices`、ドメイン層には影響しない純粋関数）。選択→フィードバック表示→「次へ」で確定という2段階にし、判定と前進を同時に行わない。漢字「書き」と同じ5問セット単位で進行・同期する（第13回ヒアリング）。「単語マスターI」は当初Lesson1-2の5語のみだったが、Lesson 2全域の99語（ユーザー提供データ内の重複5件を除いたもの）に更新済み。 | `src/app/academy/page.tsx` |
| **学習ユニット一覧の並び順（実データ優先表示）** | UI方針 | `LibraryTab`の単元一覧は、`questionType`を持つ（＝実際に取り組めるコンテンツがある）ユニットを先に表示するよう並び替える。英語のように大半のユニットが「準備中」の科目で、唯一のコンテンツ（単語マスター）が埋もれないようにするため。ユーザー指示により追加。 | `src/app/academy/page.tsx` |
| **useSetBasedQuiz / SetResultScreen（共有ロジック）** | UI基盤 | 5問セット単位で進行・同期する出題形式（漢字「書き」のセルフ採点、単語マスターの4択）が共有する状態管理フックと結果画面コンポーネント。セット進行・`SyncQuizProgress`同期・`RecordQuizAttempts`によるボーナス周回・正誤一覧表示を一箇所にまとめ、各パネルは「1問ぶんの見た目・採点トリガー」だけを個別に実装する（第13回ヒアリングで漢字「書き」から抽出・共通化）。 | `src/app/academy/page.tsx` |
| **LearningUnit.referenceText（参照用テキスト）** | エンティティの属性 | 採点対象の `Question` ではない、読み物・解説（本文・会話文・文法ポイント）を1単元に0〜1件持たせる任意項目。`questionType`とは独立（両方null、両方あり、片方だけ、のいずれも可）。`LearningUnitRow`は`referenceText`があれば「本文・文法を見る」トグルで表示する。「準備中」バッジは`questionType`も`referenceText`も無い単元のみに表示する（第14回ヒアリング）。 | `domain/models/LearningUnit.ts` |
| **LearningUnit.referenceAudioUrl（本文の聞き取り音声）** | エンティティの属性 | `referenceText`の聞き取り用音声（会話文の英語セリフのみ。ト書き・日本語訳の注釈は除く）のURLを持たせる任意項目。`referenceText`と同様0〜1件で独立。音声はgTTS（Google Text-to-Speech）で一度だけ生成し、`public/audio/`配下に静的ファイルとして同梱する（このプロジェクトはFirebase Cloud Storageが未セットアップのため、ユーザー指示によりCLAUDE.mdの本来方針から一時的に外れた運用。Storageを有効化した後にCloud Storage配信へ移行する想定）。`LearningUnitRow`の読み物表示内に`<audio>`プレイヤーとして表示する（第15回ヒアリング）。 | `domain/models/LearningUnit.ts` / `public/audio/` |
| **英作文の並べ替えUI（WordOrderQuizPanel）** | UIコンポーネント | `PassageTranslationToEnglish`専用のクイズ画面。英訳は言い回しの自由度が高く自由記述の完全一致判定に向かないため、正解の英文を空白区切りの単語トークンに分割してシャッフルし、生徒が選んだ順に並べさせる。並べた単語列（スペース結合）と正解文字列の完全一致で自動採点する（UI層の関心事。第13回ヒアリングの4択と同じ判断）。採点と前進を分離し、「採点する」で正誤表示→「次へ」で確定。漢字「書き」・単語マスターと同じ5問セット単位で進行・同期する（第14回ヒアリング）。 | `src/app/academy/page.tsx` |

> **残課題**: `CultivationProgress` / `UpcomingExam` / `Mission` の永続化（リポジトリ）、およびアプリケーション層からのトリガー（ユースケース）は、ドメイン層の設計時点では含まれていなかったが、後続の「動作確認用システム」構築時にインメモリ実装込みで用意した（`tasklist.md` を参照）。一方、`Grade`（学年段階）の進級（例: セカンドグレード→サードグレード）を表す操作はまだ無く、`CultivationProgress.initiate` 時に確定した `Grade` は不変のまま。ヒアリングの結果、進級機能は今回は不要と判断し見送った（対応グレードのコンテンツ整備を優先する、`tasklist.md` 参照）。

---

## 3. 学園案内コンテキスト (Academy Guide Context / UI)

デザインシステムそのもの。学舎割当コンテキストの判定結果に応じて、UIの色彩・フォント・装飾を動的に切り替えるプレゼンテーション層。ビジネスルールを持たないため、エンティティ・値オブジェクト・集約・仕様といった戦術的パターンの対象外（詳細は `CLAUDE.md` のデザインシステム連携セクションを参照）。

| 用語 | 分類 | 定義 | 実装 |
|---|---|---|---|
| **ThemeProvider（テーマプロバイダ）** | プレゼンテーション層コンポーネント | `House` 値オブジェクトの値を `data-theme` DOM属性に変換する、ドメイン出力とDOMを繋ぐ唯一の場所。 | `components/theme/ThemeProvider.tsx` |
| **意味トークン（Semantic Tokens）** | デザインシステム概念 | `house-bg` / `house-text` / `house-primary` / `house-on-primary` / `house-accent` / `house-focus` のこと。学舎ごとの実色（`color-regius-*` / `color-rose-*`）を抽象化する。 | `styles/tokens.css` |
| **GrimoireCard（魔導書風カード）** | UIコンポーネント | デザインシステム仕様に基づくカードコンポーネント。`title`・任意の`footer`スロットを持つ。 | `components/ui/GrimoireCard.tsx` |
| **MagicalToggle（魔法トグル）** | UIコンポーネント | デザインシステム仕様に基づくトグルスイッチコンポーネント。 | `components/ui/MagicalToggle.tsx` |
| **QuizCard（クイズカード）** | UIコンポーネント | `GrimoireCard`を土台にした、問題と解答を1枚で出すカード。`kind`（`vocabulary`/`ja-translation`/`en-translation`/`math`）ごとに章題・指示文・言語が自動で決まる。解答の開閉、ヒント、別解、数学の解き方手順、「覚えた／もう一度」の自己採点に対応。寮ごとに解答の出現演出が異なる（レギウス=中央から瞬時に開く、ローズ=霞から浮かび上がる）。デザインシステムの`project/components/QuizCard/`仕様を移植。 | `components/ui/QuizCard.tsx` |
| **TabIcon（タブ・教科ピクトグラム）** | UIコンポーネント | 24×24グリッドの線画アイコン。タブ3種（`great-hall`/`grimoire-library`/`phantom-tower`）と教科（魔導属性）5種（`kotodama`/`suhi`/`ikaigo`/`renkin`/`chishi-rekishi`）を名前で指定する。色は`currentColor`。デザインシステムの`project/assets/Icons/`・`bundle.js`のパスデータを移植。 | `components/ui/TabIcon.tsx` |
| **TabBar（タブバー）** | UIコンポーネント | 修練場のメインタブ（大広間・魔導書庫・幻影の塔）切り替え。`value`/`onChange`（制御）または`defaultValue`（非制御）、タブidごとの`badges`（例: 幻影の塔に残るニガテ数）に対応。選択中タブの表示は寮ごとに異なる（レギウス=上辺に金のバーが瞬時に現れる、ローズ=光る短い線がじわっと灯る）。デザインシステムの`project/components/TabBar/`仕様を移植。 | `components/ui/TabBar.tsx` |
| **修練場のタブ構成** | UI構成 | `src/app/academy/page.tsx`は「大広間」（本日のデイリークエスト・試験カウントダウン・予想問題ミッション）／「魔導書庫」（5属性からの科目選択・頻出問題演習）／「幻影の塔」（理解度の低い単元＝ニガテの幻影を表示し、正答で消滅＝浄化）の3タブで構成する。 | `app/academy/page.tsx` |
| **5つの魔導属性（科目の呼称）** | UI概念 | 科目を物語風に呼び分ける表示名。国語＝言霊（ことだま）、数学＝数秘（すうひ）、英語＝異界語（いかいご）、理科＝錬金（れんきん）、社会＝地誌・歴史（ちし・れきし）。ドメイン層の`Subject`型自体は変更しない（表示名のみのマッピング）。 | `app/academy/page.tsx` の `SUBJECT_ELEMENT` |
| **ニガテの幻影／浄化** | UI概念 | 「幻影の塔」で、ある学習ユニットが1回以上挑戦済み（`attemptCount > 0`）かつ理解度が一定の閾値未満（現状60%）のとき「ニガテの幻影」として表示する。正答を重ねて理解度が閾値以上になると一覧から自然に消える（＝浄化）。新しい永続状態は持たない、既存の`UnderstandingLevel`から導出する表示上の概念。 | `app/academy/page.tsx` の `WEAK_UNDERSTANDING_THRESHOLD` |

---

## 更新履歴

- 初版作成: 既存実装（学舎割当・魔力修練・学園案内の各コンテキスト）から逆引きで用語を整理。新規ビジネスルールの追加ではないため、フェーズ1の質問は発生していない。
- 追記: 魔力修練コンテキストに「主要5科目の学習による能力成長」ルールを追加（`Subject` / `SubjectAbility` / `CultivationProgress` / `CurriculumSubjectSpecification`）。ユーザーへのヒアリングにより、(1) 科目はExamTypeごとに異なる、(2) 能力値は科目ごとに独立、(3) 学舎割当コンテキストのManaQualityとは別概念、(4) LearningUnit完了ごとに固定量上昇・上限100・再完了も毎回カウント、という方針を確認済み。詳細は `specs/mana-cultivation.md` を参照。
  - **設計判断（要確認）**: `CultivationProgress` の識別子には、学舎割当コンテキストの `StudentId`（`domain/models/StudentId.ts`）をそのまま再利用する。StudentIdは外部依存を持たない値オブジェクトであり、同一生徒を指す識別子をコンテキード間で共有すること自体は許容されるという判断だが、厳密にはコンテキスト間の型依存にあたるため、気になる場合は魔力修練コンテキスト独自のID型に分離することも可能（`specs/mana-cultivation.md` 参照）。
- 追記: 魔力修練コンテキストに `Grade`（学年段階）を追加。中1〜高3を貫く7段階（`Pre`〜`Sixth`）のうち、現時点で選択可能なのは `Pre`（プレ期間/小6）と `Second`（セカンドグレード/中2）の2つ（`LAUNCHED_GRADES`）。ユーザーへのヒアリングにより、(1) Gradeは学舎割当ロジックには影響しない、(2) 1つのGradeにつき定期テスト系ExamTypeが1つ対応し英検は全Grade共通、(3) Grade型自体は将来の7値すべてを先に定義する、(4) 大学受験は今回モデル化しない、という方針を確認済み。`CultivationProgress.initiate` が `grade` を必須パラメータとして受け取るようになった（既存の呼び出し箇所もすべて更新）。詳細は `specs/mana-cultivation.md` を参照。
- 追記: 魔力修練コンテキストに「過去の間違い問題から単元理解度を算出し、次のテスト範囲からデイリーミッションを生成する。また次テスト範囲の予想問題ミッションを選択できる」ルールを追加（`UnderstandingLevel` / `UpcomingExam` / `Mission` / `FocusUnitSelectionPolicy`）。ユーザーへのヒアリングにより、(1) 理解度は正答率でそのまま算出、(2) UpcomingExamは今回エンティティとしてモデル化し生徒個人ではなくExamType単位の共有情報とする、(3) デイリーミッションは1日1件・1単元、(4) DailyミッションとMockExamミッションは共通Mission型のtypeで区別、(5) recordAttempt（正誤記録）はcompleteLearningUnit（能力成長）とは別メソッド、(6) UnderstandingLevelとMissionは既存のCultivationProgress集約に含める、という方針を確認済み。詳細は `specs/mana-cultivation.md` を参照。
- 追記: 魔力修練コンテキストに `QuestionType`（出題形式）／`SubjectQuestionTypePolicy` を追加し、`LearningUnit` に `questionType`（省略可）フィールドを追加。ユーザーへのヒアリングにより、(1) 単語テスト・和訳・英訳は既存の文法単元（例:「不定詞」）とは独立した別の `LearningUnit` として表現する、(2) `QuestionType` の仕組みは全科目共通の汎用設計とする（現時点では英語の3形式のみ定義）、(3) 既存の `completeLearningUnit`/`recordAttempt` の仕組みをそのまま使い、出題形式ごとの成長・記録ロジックは追加しない、という方針を確認済み。`LearningUnit` の生成は `private constructor` + `static create(props, subject)` に変更（破壊的変更、既存の呼び出し箇所もすべて更新）。詳細は `specs/mana-cultivation.md` を参照。
