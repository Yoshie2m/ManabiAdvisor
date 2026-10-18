# CLAUDE.md

このファイルは、本リポジトリでコードを扱う際にClaude Code（claude.ai/code）に向けたガイダンスを提供する。

## プロジェクトの現状

本リポジトリには現時点で計画ドキュメント（`README.md`）のみが存在する。`package.json` やソースツリー、ビルドツールは未構築であり、Next.js プロジェクトがスキャフォールドされるまではビルド/lint/テストコマンドは存在しない。スキャフォールド時は、独自のレイアウトを考案するのではなく、以下のスタック・構成に従うこと。

## 対応する学習領域

本学園（アプリケーション）は以下の学習ニーズに対応する:
- 中学2年生の定期テスト対策
- 英検対策
- 小学6年生の中学受験対策

複数の学年・試験種別を同時に扱うため、「魔力修練コンテキスト (Mana Cultivation Context)」のモデリングやコンテンツ構造（教材・出題範囲・難易度等）は、学年・試験種別ごとに異なるカリキュラムを表現できるよう設計すること。新たなコンテキストを増やすのではなく、このコンテキスト内のモデリングで吸収する。

**学習コンテンツの配置方針**: 「どの学年・試験種別がどの出題範囲・難易度構成を持つか」という構造・ルールは `ExamType` / `Curriculum` / `LearningUnit` 等のドメインモデルとして `domain/models/` に表現する。問題文・選択肢・解説・音声/画像などのコンテンツ本体はTypeScriptコードに埋め込まず、Firestoreのコレクション／Cloud Storageに格納し、`infrastructure/firebase/` のRepository経由で取得すること。コンテンツ管理自体（作成・タグ付け・バージョン管理等）が複雑化した場合は、独立した「教材コンテキスト (Content/Curriculum Context)」への切り出しを検討する。

## 技術スタック

- **Frontend**: TypeScript + Next.js (App Router) / React
- **Styling**: Tailwind CSS。アプリ内の「学舎（House）」単位で動的にテーマを切り替える
- **Backend & DB**: Firebase（Firestore、Firebase Authentication、Security Rules 併用）
- **State management**: Zustand / React Context を用いて、ドメインモデルをプレゼンテーション層へ射影する

## ドメインモデル（DDD）

本プロジェクトはドメイン駆動設計（DDD）で構築する。ビジネスロジックは必ずドメイン層に置き、UIコンポーネントやFirestoreクエリに直接書いてはならない（詳細は後述の「開発の掟」参照）。

境界づけられたコンテキスト（Bounded Contexts）:
1. **学舎割当コンテキスト (House Assignment Context)** — 生徒の入学時に、各学舎（`RegiusCardis` または `RoseSleep`）の特性を提示し、生徒自身がどちらに入りたいかを選択する。これが中心ドメインとなる。
2. **魔力修練コンテキスト (Mana Cultivation Context)** — 配属後の生徒の魔力パラメータの成長と、修練の進捗管理。
3. **学園案内コンテキスト (Academy Guide Context / UI)** — デザインシステムそのもの。配属学舎のコンテキストに応じてUIの色彩・フォント・装飾を動的に切り替えるプレゼンテーション層。

各コンテキストの `domain/` 層で使う戦術的パターン:
- **値オブジェクト (Value Objects)**: `StudentId`、`House`（`RegiusCardis` | `RoseSleep`。生徒が選んだ値がそのまま使われ、判定ロジックは持たない）
- **エンティティ (Entities)**: `Student`
- **集約ルート (Aggregate Roots)**: `StudentAggregate` — `Student` エンティティをルートとし、生徒が選んだ学舎をそのまま確定させて生成する

## ディレクトリ構造（目標レイアウト）

`src/` は、インフラ（Firebase）やフレームワーク（Next.js）の変更がドメインロジックに波及しないよう、オニオンアーキテクチャ/クリーンアーキテクチャのレイヤー構造を採用する:

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
        │   ├── models/          # Student, House などのEntity / Value Object
        │   └── repositories/    # StudentRepository (インターフェース定義)
        ├── usecase/             # ユースケース層（アプリケーションサービス、例: EnrollStudent/）
        └── infrastructure/      # インフラストラクチャ層
            └── firebase/        # Firebaseクライアント・Repositoryの具象実装

public/
├── fonts/                       # デザインシステムのフォントアセット (Cinzel 等)
└── images/
    └── magic-classroom.jpg      # デザインシステムの背景アセット (教室背景)
```

新しい境界づけられたコンテキストを追加する際も、`src/contexts/` 配下に同じ `domain/usecase/infrastructure` のレイヤー構造で配置する。

## デザインシステム連携

UI/UXの単一の真実源（Single Source of Truth）は、外部の [Advisaria Magica Academy Design System](https://claude.ai/artifact/61d25pEcPEwJhNmt7tpmS4) アーティファクトである。トークンやコンポーネント仕様に変更が必要な場合は、まずデザインシステム側を更新し、そこから `src/styles/tokens.css` やコンポーネント実装へ反映する。ローカルでスタイリング判断を独自に分岐させてはならない。

- **トークン**: 色（寮別）・タイポグラフィ・余白・角丸は、デザインシステムの `tokens.json` に定義され、`src/styles/tokens.css` のCSS変数（または Tailwind の `theme.extend`）に変換される。
- **寮テーマ切り替え**: ルート要素（または任意の部分木）に `data-theme="regiuscardis" | "rosesleep"` を設定する。この属性値は戦術的DDDモデルの `House` 値オブジェクト（`RegiusCardis` / `RoseSleep`）とそのまま対応し、`components/theme/` の `ThemeProvider` が学舎割当コンテキストで生徒が選んだ学舎をこの属性としてDOMに反映する、ドメイン出力とDOMを繋ぐ唯一の場所であるべき。
- **意味トークン**: UIは `house-bg` / `house-text` / `house-primary` / `house-on-primary` / `house-accent` / `house-focus` の意味トークンで塗る。寮固有の意匠を描く場合のみ `color-regius-*` / `color-rose-*` を直接使用する。
- **タイポグラフィ**: 見出しは `display`（Cinzel, Google Fonts）、本文は `base`（Helvetica Neue / Arial）。Cinzelは和文グリフを持たないため、和文は見出しで添える程度に留め、本文はシステムフォントにフォールバックさせる。
- **コンポーネント**: `GrimoireCard`（魔導書風カード）、`MagicalToggle`（魔法トグル）等は、デザインシステムの `README.md` / `preview.html` の仕様に基づき `src/components/ui/` 配下に React + TypeScript で実装する。`prefers-reduced-motion` 時は光・波紋・発光の演出を停止すること。
- **背景装飾**: 教室背景画像 (`magic-classroom.jpg`) には寮別のベールを自動で重ねるユーティリティ（デザインシステムの `ama-backdrop` 相当）が必要。レギウスは漆黒80→92%のベール、ローズは深紫のぼかし＋放射状ベール。
- **アクセシビリティ**: コントラスト比・フォーカスリングはデザインシステムの規定値を厳守する（例: `house-text` on `house-bg` はレギウス19.5:1／ローズ13.7:1、フォーカスリングは2px実線・2pxオフセット・地に対し3:1以上）。

## 開発の掟 (Spartan Quality Gates)

以下は提案ではなく、プロジェクトの絶対ルールである:

1. **仕様駆動開発 (Specification-Driven Development)**: ビジネスロジックをUIやFirestoreのクエリに直接記述してはならない。必ず各コンテキストの `domain/specs/` に仕様オブジェクトを定義し、それらを組み合わせて判定する。
2. **型安全性の厳守**: `any` の使用は一切禁止。以下のコマンドでコンパイルエラーがゼロであることが、コミットの絶対条件:
   ```bash
   npx tsc --noEmit
   ```
3. **テストによる不変条件の防衛**: ドメインの不変条件（例：ある学習ユニットを完了すると対応科目の能力値が必ず上昇する等）は、すべてユニットテストによって証明されなければならない。

## `ddd-spec-guardian` スキルの活用

本プロジェクトには、TypeScriptでのDDD準拠・仕様駆動な機能開発専用のスラッシュコマンドスキル（`ddd-spec-guardian`）がある。ドメインロジックに関わるタスク（新機能追加、ドメインモデルの変更、ビジネスルールの変更）では必ずこのスキルを使用する。純粋なUIの見た目調整や、ドメインに関係しないツール設定変更には使わない。
