# 戦術的仕様: 学舎割当コンテキスト (House Assignment Context)

用語定義は `../glossary.md` の「1. 学舎割当コンテキスト」を参照。

## 意思決定の経緯（第2回ヒアリング: 鑑定UXの変更）

初版では「魔力資質（`ManaQuality`: 秩序度・混沌度・魔力量）を数値で入力し、`HouseAssignmentSpecification` が自動判定する」という仕様だった。これを「数値入力ではなく、各学舎の特性を選択肢として提示し、生徒自身がどちらに入りたいかを選ぶ」方式に変更する。ユーザーへのヒアリングにより、以下の方針を確認済み:

1. `ManaQuality` 値オブジェクトは今回の変更で完全に廃止する（入力UIだけでなく、型自体をコードから削除する）。
2. 生徒が選んだ学舎は常にそのまま確定する。人数上限・抽選などの例外条件は無い。
3. 上記により `HouseAssignmentSpecification`（`regiusCardisSpecification` / `roseSleepSpecification`）および `StudentAggregate.decideHouse()` は不要になるため削除する。判定ロジックが無くなるので、`AssignHouse` ユースケース（判定専用の別ステップ）も不要になり削除する。学舎の確定は `EnrollStudent`（入学）ユースケースが選ばれた学舎を受け取ってそのまま確定させる、1ステップのフローに統合する。

## 意思決定の経緯（第3回ヒアリング: バディの追加）

ユーザーから「勉強を一緒に頑張るキャラクター（バディ）を選び、修練場の大広間に表示させたい」という依頼を受けた。選べるのは天羽（アモウ）と影島（カゲシマ）の2人で、鑑定画面で選ぶ。天羽はサッカー部部長の元気な体育会系、影島は根暗だがギターを練習している文化系。大広間で、勉強や部活に対して「頑張れ！」というメッセージを日々出してくれる。キャラクターの絵はデザインシステムの「Characters」グループのものを使う。実装前にユーザーへ4点を確認し、以下の方針で合意済み:

1. **選ぶタイミング**: 鑑定画面の「おかえりなさい」カードで、いつでも選び直せる。未選択も可で、選ぶまでは大広間にバディは出ない（入学時の必須項目にはしない）。
2. **フレーズ数**: 性格が正反対なので、キャラごとに30個（計60個）用意する。
3. **出し方**: 1日1つで、日付（日本時間）で決まる。同じ日は何度開いても同じメッセージで、日が変わると次のフレーズになり、30日で一巡する。
4. **格納先**: 応援フレーズはコンテンツ本体なので、`CLAUDE.md`の方針どおりFirestore（`buddyCheers`コレクション）にシードで投入し、リポジトリ経由で読む。

**コンテキストの判断**: バディは、学舎と同じく鑑定画面で生徒自身が選ぶ「生徒の選択」であり、学習の進捗（魔力修練コンテキスト）とは独立している。そのため学舎割当コンテキストの`Student`に持たせ、応援フレーズとその日のフレーズを選ぶルールも同じコンテキストに置く。

### 追加・変更する型

```ts
// 値オブジェクト
const BUDDIES = ["Amou", "Kageshima"] as const;
type Buddy = (typeof BUDDIES)[number];
function isBuddy(value: string): value is Buddy;

// エンティティ（応援フレーズ）
class BuddyCheer {
  static create(props: { id: string; buddy: Buddy; order: number; message: string }): BuddyCheer; // messageが空文字・orderが0未満の整数でなければ例外
  readonly id: string;
  readonly buddy: Buddy;
  readonly order: number; // 日替わりで出す順番（0始まり）
  readonly message: string;
}

// 仕様（ポリシー）: その日の応援フレーズを選ぶ
interface DailyCheerPolicy {
  select(cheers: readonly BuddyCheer[], today: Date): BuddyCheer | null;
}
```

- `Student`／`StudentAggregate`に`buddy: Buddy | null`と`chooseBuddy(buddy: Buddy): void`を追加する。`create(id, house)`で生成した生徒のバディは`null`。永続化からの復元用に`create(id, house, buddy?)`で受け取れるようにする。
- `DailyCheerPolicy`は、渡されたフレーズを`order`順に並べ、日本時間の日付から数えた日数をフレーズ数で割った余りの番号のフレーズを返す。フレーズが無ければ`null`。
- リポジトリ`BuddyCheerRepository.findByBuddy(buddy)`を追加する。
- ユースケース`ChooseBuddy(studentId, buddy)`（読み込み→`chooseBuddy`→保存。生徒がいなければ例外）と、`GetTodaysBuddyCheer(buddy, today)`（そのバディのフレーズを読み、`DailyCheerPolicy`で1つ選ぶ）を追加する。

### インフラ・UI

- `students/{studentId}`に`buddy`を追加する（無ければ未選択として読む）。
- `buddyCheers/{id}`コレクション（`{ buddy, order, message }`）を新設する。Firestoreルールは他のコンテンツと同じく「読み取りは誰でも、書き込みは禁止」とする。
- 鑑定画面の「おかえりなさい」カードに、天羽・影島の胸像つきの選択ボタンを置く。
- 大広間の先頭に、選んだバディの胸像と吹き出し（その日の応援フレーズ）を表示する。絵はデザインシステムの胸像SVG（`amou-pixel.svg`／`kage-pixel.svg`）を使い、注記どおり真っ黒の地に直接置かずカードの上に置く。

### テストで守る不変条件

- `StudentAggregate.create(id, house)`のバディは`null`。`chooseBuddy`で選んだ値になり、何度でも選び直せる。学舎は変わらない。
- `isBuddy`は`Amou`・`Kageshima`だけを受け付ける。
- `BuddyCheer.create`は空のメッセージや負の`order`を拒否する。
- `DailyCheerPolicy`: 同じ日（日本時間）なら時刻が違っても同じフレーズを返す。翌日は次の`order`のフレーズを返し、フレーズ数の日数で一巡する。渡す順番に関係なく`order`で決まる。フレーズが無ければ`null`。日本時間の0時で切り替わる（UTCの15時）。
- `ChooseBuddy`は選んだバディを保存し、生徒がいなければ例外を投げる。

## 値オブジェクト

### StudentId（変更なし）

```ts
class StudentId {
  static fromString(value: string): StudentId; // value.trim() が空文字なら例外
  toString(): string;
  equals(other: StudentId): boolean;
}
```

- **不変条件**: 空文字列（trim後）から生成できない。

### House（変更なし）

```ts
const HOUSES = ["RegiusCardis", "RoseSleep"] as const;
type House = (typeof HOUSES)[number];
function isHouse(value: string): value is House;
```

- **不変条件**: 値は `"RegiusCardis"` または `"RoseSleep"` のいずれかのみ。
- 各値の特性（UIで選択肢として提示する説明文）はドメイン層の関心事ではなく、プレゼンテーション層（`src/app/page.tsx` 等）で保持する。

## エンティティ

### Student

```ts
class Student {
  constructor(id: StudentId, house: House);
  getHouse(): House;
}
```

- **識別子**: `StudentId`。
- 生成時に選ばれた学舎がそのまま確定し、以後変更する操作は無い（状態遷移・`assignTo` は廃止）。

## 集約ルート

### StudentAggregate

```ts
class StudentAggregate {
  static create(id: StudentId, house: House): StudentAggregate;
  get id(): StudentId;
  get house(): House;
}
```

- `create` は生徒が選んだ学舎をそのまま確定させて集約を生成する。判定ロジックが無いため、新規生成と永続化からの復元（旧 `reconstruct`）は同じ `create` で表現できる（復元専用ファクトリは不要）。
- `house` は常に非 `null`。未配属の状態は存在しない。

## リポジトリ

### StudentRepository（インターフェース、変更なし）

```ts
interface StudentRepository {
  findById(id: StudentId): Promise<StudentAggregate | null>;
  save(student: StudentAggregate): Promise<void>;
}
```

- 具象実装 `FirebaseStudentRepository`（`infrastructure/firebase/`）。Firestoreの `students/{studentId}` コレクションに `{ house }` の形で永続化する（`manaQuality` フィールドは廃止）。復元時は `house` を `isHouse` で検証し、`StudentAggregate.create(id, house)` で復元する。

## ユースケース

### EnrollStudent（変更: 選ばれた学舎を直接受け取り、確定まで1ステップで行う）

```ts
class EnrollStudent {
  constructor(studentRepository: StudentRepository);
  execute(studentId: StudentId, house: House): Promise<StudentAggregate>;
}
```

フロー: `StudentAggregate.create(studentId, house)` → `studentRepository.save(aggregate)` → 生成した集約を返す。

旧 `AssignHouse` ユースケース（`usecase/AssignHouse/`）は判定ステップが不要になったため削除する。

## テスト不変条件チェックリスト

- [ ] `StudentId.fromString("")` および空白のみの文字列は例外を投げる。
- [ ] `StudentAggregate.create(id, "RegiusCardis")` / `create(id, "RoseSleep")` のそれぞれで `house` が選んだ値と一致する。
- [ ] `EnrollStudent.execute(studentId, house)` は選んだ `house` を持つ `StudentAggregate` を生成し、`studentRepository.save` を1回呼び出し、その集約を返す。
