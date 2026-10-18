# Advisaria Magica Academy

## 0. 学園概要 (Academy Overview)
* **学園名**: アドヴィザリア・マギカ導師範大学府 (英語表記: Advisaria Magica Academy)
* **世界観背景**: 
  偉大な賢者（アドバイザー）たちが集い、生徒一人ひとりの魔力の資質を見抜いて導く最高峰の学園。
  規律正しい「レギウス・カルディス」の生徒には厳格な法を、ミステリアスな「ローズスリープ」の生徒には個性を伸ばす助言を与えます。
* **UX思想（Manabi Advisorの精神）**:
  すべてのナビゲーション、ボタン、インフォメーションは、生徒（ユーザー）を迷わせない「導きの光」として機能します。
  UIの使いやすさを担保しつつ、魔法の神秘性を損なわないインタラクションを提供します。
* **対応する学習領域**:
  本学園は以下の学習ニーズに対応する:
  * 中学2年生の定期テスト対策
  * 英検対策
  * 小学6年生の中学受験対策

---

## 1. 魔術構成 (Technical Stack)
本アプリケーションは、堅牢なフロントエンドと即応性の高いサーバーレスバックエンドを組み合わせて構築されます。

* **Frontend**: TypeScript + Next.js (App Router) / React
* **Styling**: Tailwind CSS (学舎のテーマに応じた動的テーマ切り替え)
* **Backend & Database**: Firebase (Firestore / Firebase Authentication、Security Rulesによる厳格なデータ防衛)
* **State Management**: Zustand / React Context (ドメインモデルのPresentation層への射影)

---

## 2. 境界づけられたコンテキスト (Bounded Contexts)
ドメイン駆動設計（DDD）に基づき、システムを以下の3つの独立したコンテキストに分離して開発します。

1. **学舎割当コンテキスト (House Assignment Context)**
   * 生徒の入学、魔力資質の鑑定、および配属学舎（レギウス／ローズ）の判定ルールを司る中心ドメイン。
2. **魔力修練コンテキスト (Mana Cultivation Context)**
   * 配属後の生徒の魔力パラメータの成長、修練の進捗状況を管理するドメイン。
   * 中学2年生の定期テスト対策・英検対策・小学6年生の中学受験対策といった、学年・試験種別ごとに異なるカリキュラム（教材・出題範囲・難易度等）の多様性は、新たなコンテキストを増やすのではなく、このコンテキスト内のモデリングで吸収する。
   * **学習コンテンツの配置方針**: 「どの学年・試験種別がどの出題範囲・難易度構成を持つか」という構造・ルールは `ExamType` / `Curriculum` / `LearningUnit` 等のドメインモデルとして `domain/models/` に表現する。一方、問題文・選択肢・解説・音声/画像などのコンテンツ本体はTypeScriptコードに埋め込まず、Firestoreのコレクション／Cloud Storageに格納し、`infrastructure/firebase/` のRepository経由で取得する。コンテンツ管理自体（作成・タグ付け・バージョン管理等）が複雑化した場合は、独立した「教材コンテキスト (Content/Curriculum Context)」への切り出しを検討する。
3. **学園案内コンテキスト (Academy Guide Context / UI)**
   * [デザインシステム](#5-デザインシステム連携-design-system-integration)そのもの。配属学舎のコンテキストに応じてUIの色彩・フォント・装飾を動的に切り替えるプレゼンテーション層。

---

## 3. 戦術的DDDモデル (Tactical DDD Architecture)
ドメイン知識（ビジネスルール）を技術インフラやUIから徹底的に隔離するため、以下の戦術的パターンを適用します。

### ドメイン層の構成要素
* **値オブジェクト (Value Objects)**:
  * `StudentId`: 生徒を一意に識別する不変の識別子。
  * `ManaQuality`: 魔力パラメータ（秩序度・混沌度・魔力量など）を表す不変オブジェクト。
  * `House`: 配属先の学舎（`RegiusCardis` または `RoseSleep`）を表現する列挙値/値オブジェクト。
* **エンティティ (Entities)**:
  * `Student`: 識別を持ち、状態が変化する生徒オブジェクト。
* **集約ルート (Aggregate Roots)**:
  * `StudentAggregate`: 生徒エンティティをルートとし、魔力資質や学舎の状態遷移に関する不変条件（ビジネスルール）を一手に防衛する境界。
* **仕様 (Specifications)**:
  * `HouseAssignmentSpecification`: 生徒の魔力資質を評価し、どの学舎に属するべきかを判定する純粋なドメインルール・バリネーター。

---

## 4. 📂 ディレクトリ構造 (Architecture)
`src/` 配下は、インフラ（Firebase）やフレームワーク（Next.js）の変更がドメインロジックに波及しないよう、オニオンアーキテクチャ/クリーンアーキテクチャのレイヤー構造を採用します。

```text
src/
├── app/                         # Next.js App Router (Presentation/Routing)
├── components/
│   ├── ui/                      # デザインシステム連携コンポーネント (GrimoireCard, MagicalToggle 等)
│   └── theme/                   # 寮テーマ切り替え (ThemeProvider / data-theme 制御)
├── styles/
│   ├── tokens.css               # デザインシステム tokens.json から生成するCSS変数
│   └── globals.css
└── contexts/                    # 境界づけられたコンテキスト別の実装
    └── house-assignment/        # 学舎割当コンテキスト
        ├── domain/              # ドメイン層（純粋なTypeScript / 外部依存ゼロ）
        │   ├── models/          # Student, ManaQuality などのEntity / Value Object
        │   ├── specs/           # HouseAssignmentSpecification (仕様パターン)
        │   └── repositories/    # StudentRepository (インターフェース定義)
        ├── usecase/             # ユースケース層（アプリケーションサービス）
        │   └── AssignHouse/     # 学舎判定・配属を実行するシナリオ
        └── infrastructure/      # インフラストラクチャ層
            └── firebase/        # Firebaseクライアント・Repositoryの具象実装

public/
├── fonts/                       # デザインシステムのフォントアセット (Cinzel 等)
└── images/
    └── magic-classroom.jpg      # デザインシステムの背景アセット (教室背景)
```

---

## 5. 🎨 デザインシステム連携 (Design System Integration)
本プロジェクトのUI/UXは、専用の [Advisaria Magica Academy Design System](https://claude.ai/artifact/61d25pEcPEwJhNmt7tpmS4) を単一の真実源 (Single Source of Truth) とします。トークン・コンポーネント仕様に変更があった場合は、まずデザインシステム側を更新し、そこから `src/styles/tokens.css` やコンポーネント実装へ反映してください。

* **トークン**: `tokens.json` に色（寮別）・タイポグラフィ・余白・角丸を定義。これを `src/styles/tokens.css` のCSS変数、または Tailwind の `theme.extend` に変換して取り込む。
* **寮テーマ切り替え**: ルート要素（または任意の部分木）の `data-theme="regiuscardis" | "rosesleep"` でトーン＆マナーを切り替える。これは戦術的DDDモデルの `House` 値オブジェクト（`RegiusCardis` / `RoseSleep`）とそのまま対応し、学舎割当コンテキストの判定結果を `components/theme/` の ThemeProvider が属性値としてそのまま反映する。
* **意味トークン**: UIは `house-bg` / `house-text` / `house-primary` / `house-on-primary` / `house-accent` / `house-focus` の意味トークンで塗る。寮固有の意匠を描く場合のみ `color-regius-*` / `color-rose-*` を直接使用する。
* **タイポグラフィ**: 見出し `display`（Cinzel, Google Fonts）、本文 `base`（Helvetica Neue / Arial）。Cinzelは和文を持たないため、和文は添える程度に留め本文はシステムフォントにフォールバックする。
* **コンポーネント**: `GrimoireCard`（魔導書風カード）、`MagicalToggle`（魔法トグル）をデザインシステムのガイドライン（各 `README.md` / `preview.html`）に基づき `src/components/ui/` 配下に React + TypeScript で実装する。`prefers-reduced-motion` 時は光・波紋・発光の演出を停止すること。
* **背景装飾**: 教室背景画像 (`magic-classroom.jpg`) には寮別のベールを自動で重ねるユーティリティ（出典の `ama-backdrop` 相当）を実装する。レギウスは漆黒80→92%のベール、ローズは深紫のぼかし＋放射状ベール。
* **アクセシビリティ**: コントラスト比・フォーカスリングはデザインシステムの規定値を厳守する（例: `house-text` on `house-bg` はレギウス19.5:1／ローズ13.7:1、フォーカスリングは2px実線・2pxオフセットで地に対し3:1以上）。

---

## 6. 🛡️ 開発の掟 (Spartan Quality Gates)
当学府のシステム構築においては、以下の品質ゲートの通過が義務付けられます。

1. **仕様駆動開発 (Specification-Driven Development)**:
   すべてのビジネスロジックはUIやFirestoreのクエリに直接記述してはならない。必ず `domain/specs/` に仕様オブジェクトを定義し、それを結合して判定すること。
2. **型安全性の厳守**:
   コンパイルエラーおよび型定義の妥協（`any` の使用）は一切禁止する。
   ```bash
   npx tsc --noEmit
   ```
   上記コマンドでエラーがゼロであることをコミットの絶対条件とする。
3. **テストの防衛**:
   ドメインの不変条件（例：特定の魔力数値を持つ生徒は必ずレギウスに配属される等）は、すべてユニットテストによって証明されなければならない。

