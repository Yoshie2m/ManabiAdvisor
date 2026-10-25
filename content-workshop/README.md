# content-workshop（教材素材の作業場）

教科書・プリント・問題集の写真から、アプリへ登録するための素材（md＋画像）を作るローカル用の作業フォルダ。
このREADME以外はgit管理外（`.gitignore`）。教材の写真や書き起こしをGitHubに上げないため。

## フォルダ構成

```text
content-workshop/
├── README.md          # この手順書（唯一コミットされるファイル）
├── inbox/             # 変換したい写真を置く
└── output/
    └── <素材ID>/      # 例: english-l2-s2, math-ex101, kanji-test-03
        ├── content.md # 書き起こし（下記「mdの書式」）
        ├── images/    # 図・表・グラフなどの切り出し画像（必要な場合のみ）
        └── source/    # 変換に使った元の写真（inboxから移動）
```

## 使い方

1. 写真を `inbox/` に置く（1つの素材が複数枚ならまとめて置く）。
2. Claudeに「content-workshopのinboxを変換して」と頼む。素材IDや教科・単元名を添えるとよい。
3. Claudeが `output/<素材ID>/` に `content.md` と `images/` を作り、元の写真を `source/` へ移す。
4. 内容を確認し、読み取りの怪しい箇所（`<!-- 要確認: ... -->`）を直す。
5. Claudeに「output/<素材ID>をアプリに登録して」と頼む（通常の登録手順＝仕様確認→seedData更新→Firestore再投入）。

## Claudeへの変換ルール

- 写真に書かれている内容だけを書き起こす。解答や解説が写真に無いのに推測で埋めない。補う場合は `<!-- Claude補足 -->` を付け、登録前にユーザーの確認を取る。
- 読み取れない・自信のない文字は `<!-- 要確認: 〇〇 か △△ -->` を残す。
- HEIC写真は先にJPEGへ変換する: `sips -s format jpeg in.HEIC --out in.jpg`
- 図・表・グラフ・挿絵など、文字にできない部分だけを画像として切り出す: `sips -c <高さ> <幅> --cropOffset <上> <左> source/p1.jpg --out images/fig-01.png`
  - 切り出したら画像を開いて、範囲がずれていないか確認する。
  - ファイル名は `fig-01.png` のような連番。md内では `![説明](images/fig-01.png)` で参照する。

## mdの書式

アプリのデータ構造（`Curriculum` → `LearningUnit` → `Question`）に合わせる。不要な節は省略してよい。

```markdown
---
subject: English            # English / Math / Japanese / Science / SocialStudies
examType: JuniorHigh2ndYearRegularExam
source: New Horizon 2 p.24-25   # 出典（教科書名・ページ）
---

# Lesson 2 Scene 2: 〇〇〇       ← 学習ユニットのタイトル

## 本文
（会話文・本文。アプリの「本文・文法を見る」に出す内容）

## 文法・ポイント
（文法の説明、公式、考え方など）

## 問題
questionType: PassageTranslationToEnglish   # 下記の一覧から選ぶ

### 1
- 問題: サラはなんて静かな赤ちゃんなのでしょう。
- 解答: What a quiet baby Sarah is!
- 解説: （任意。複数行可）
- 図: images/fig-01.png（任意）

### 2
...
```

### questionTypeの一覧

| 値 | 内容 | 教科 |
| --- | --- | --- |
| `VocabularyTest` | 単語テスト | 英語 |
| `PassageTranslationToJapanese` | 本文の和訳 | 英語 |
| `PassageTranslationToEnglish` | 英訳問題（並べ替え） | 英語 |
| `Calculation` | 計算問題 | 数学 |
| `WordProblem` | 文章題 | 数学 |
| `KanjiWriting` | 漢字の書き | 国語 |
| `KanjiReading` | 漢字の読み | 国語 |

一覧に無い形式（理科・社会など）が必要な場合は、登録時にClaudeと相談して追加する。

## 画像をアプリに載せる場合

`images/` の画像をアプリで表示するには、登録時に配置先を決める必要がある（`CLAUDE.md` の方針ではCloud Storage。現状は音声と同じく `public/` への同梱が暫定運用）。また、問題に画像を添える項目はまだドメインモデルに無いので、初回は仕様の追加から行う。
