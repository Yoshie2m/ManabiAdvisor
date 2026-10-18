# 戦術的仕様: 学舎割当コンテキスト (House Assignment Context)

用語定義は `../glossary.md` の「1. 学舎割当コンテキスト」を参照。

## 意思決定の経緯（第2回ヒアリング: 鑑定UXの変更）

初版では「魔力資質（`ManaQuality`: 秩序度・混沌度・魔力量）を数値で入力し、`HouseAssignmentSpecification` が自動判定する」という仕様だった。これを「数値入力ではなく、各学舎の特性を選択肢として提示し、生徒自身がどちらに入りたいかを選ぶ」方式に変更する。ユーザーへのヒアリングにより、以下の方針を確認済み:

1. `ManaQuality` 値オブジェクトは今回の変更で完全に廃止する（入力UIだけでなく、型自体をコードから削除する）。
2. 生徒が選んだ学舎は常にそのまま確定する。人数上限・抽選などの例外条件は無い。
3. 上記により `HouseAssignmentSpecification`（`regiusCardisSpecification` / `roseSleepSpecification`）および `StudentAggregate.decideHouse()` は不要になるため削除する。判定ロジックが無くなるので、`AssignHouse` ユースケース（判定専用の別ステップ）も不要になり削除する。学舎の確定は `EnrollStudent`（入学）ユースケースが選ばれた学舎を受け取ってそのまま確定させる、1ステップのフローに統合する。

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
