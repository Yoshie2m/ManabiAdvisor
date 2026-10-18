# 戦術的仕様: 学園案内コンテキスト (Academy Guide Context / UI)

用語定義は `../glossary.md` の「3. 学園案内コンテキスト」を参照。

本コンテキストはビジネスロジックを持たないプレゼンテーション層（デザインシステムそのもの）であるため、値オブジェクト・エンティティ・集約・仕様といった戦術的DDDパターンの対象外。したがって `domain/` ディレクトリは存在しない。

## 責務

- `House` 値オブジェクト（学舎割当コンテキストの出力）を受け取り、`data-theme` DOM属性に変換する（`ThemeProvider`）。
- 外部の [Advisaria Magica Academy Design System](https://claude.ai/artifact/61d25pEcPEwJhNmt7tpmS4) を単一の真実源とし、トークン（`styles/tokens.css`）とコンポーネント（`components/ui/`）を同期する。

## 唯一の不変条件

- `ThemeProvider` が、ドメイン層の判定結果（`House`）とDOM（`data-theme`属性）を繋ぐ**唯一の場所**であること。他のコンポーネントやページが独自に `data-theme` を書き換えたり、学舎に応じたスタイル分岐をハードコードしたりしてはならない（`CLAUDE.md` 参照）。

この制約はユニットテストではなく、コードレビュー／grep（`data-theme` の書き込み箇所が `ThemeProvider.tsx` 以外に存在しないこと）で担保する。

## 変更時のルール

トークンやコンポーネント仕様の変更は、まずデザインシステム側のアーティファクトを更新し、そこから本リポジトリへ反映すること。ローカルでスタイリング判断を独自に分岐させない（`CLAUDE.md` 参照）。
