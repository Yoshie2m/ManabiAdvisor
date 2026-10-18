# 戦術的仕様: 学舎割当コンテキスト (House Assignment Context)

用語定義は `../glossary.md` の「1. 学舎割当コンテキスト」を参照。本ドキュメントは既存実装 (`src/contexts/house-assignment/`) を仕様として明文化したものであり、新規のビジネスルール追加は含まない。

## 値オブジェクト

### StudentId

```ts
class StudentId {
  static fromString(value: string): StudentId; // value.trim() が空文字なら例外
  toString(): string;
  equals(other: StudentId): boolean;
}
```

- **不変条件**: 空文字列（trim後）から生成できない。

### ManaQuality

```ts
type ManaQualityProps = { order: number; chaos: number; amount: number };

class ManaQuality {
  static create(props: ManaQualityProps): ManaQuality; // 各値が範囲外なら例外
  readonly order: number;  // 秩序度
  readonly chaos: number;  // 混沌度
  readonly amount: number; // 魔力量
}
```

- **不変条件**: `order` / `chaos` / `amount` はいずれも `0` 以上 `100` 以下。範囲外の値が1つでもあれば生成時に例外を投げる。
- 生成後は `readonly` のため不変。

### House

```ts
const HOUSES = ["RegiusCardis", "RoseSleep"] as const;
type House = (typeof HOUSES)[number];
function isHouse(value: string): value is House;
```

- **不変条件**: 値は `"RegiusCardis"` または `"RoseSleep"` のいずれかのみ。

## エンティティ

### Student

```ts
class Student {
  constructor(id: StudentId, manaQuality: ManaQuality, house: House | null = null);
  getManaQuality(): ManaQuality;
  getHouse(): House | null;
  assignTo(house: House): void; // 学舎を確定させる
}
```

- **識別子**: `StudentId`。
- **状態遷移**: `house` は未配属（`null`）→ 配属済み（`House`）の一方向。`assignTo` は集約（`StudentAggregate`）経由でのみ呼び出すこと。

## 仕様 (Specification)

### HouseAssignmentSpecification

```ts
interface HouseAssignmentSpecification {
  readonly house: House;
  isSatisfiedBy(manaQuality: ManaQuality): boolean;
}
```

実装済みの仕様インスタンス:

| 仕様 | 学舎 | 判定条件 |
|---|---|---|
| `regiusCardisSpecification` | `RegiusCardis` | `manaQuality.order >= manaQuality.chaos` |
| `roseSleepSpecification` | `RoseSleep` | `manaQuality.chaos > manaQuality.order` |

- 2つの仕様は互いに排他的かつ網羅的（`order >= chaos` と `chaos > order` は全実数で過不足なく分岐する）。`amount`（魔力量）は現行の判定条件には関与しない。
- `houseAssignmentSpecifications` 配列の順序でマッチングを行う（`Array.prototype.find`）。将来仕様を追加する場合は、排他性が崩れないよう既存2仕様との関係を明文化してから追加する。

## 集約ルート

### StudentAggregate

```ts
class StudentAggregate {
  static create(id: StudentId, manaQuality: ManaQuality): StudentAggregate;
  get id(): StudentId;
  get house(): House | null;
  decideHouse(): House; // 仕様群に照合し、Studentへ配属を確定して返す
}
```

- **不変条件（最重要）**: `decideHouse()` はいずれかの `HouseAssignmentSpecification` に合致した場合のみ学舎を確定させる。合致する仕様が1つもない場合は例外を投げ、`Student.house` は変更しない。
- `decideHouse()` 呼び出し後は `student.getHouse()` が必ず非 `null` になる（例外が投げられなかった場合）。
- 集約の外部（ユースケース層・UI）から直接 `Student.assignTo` を呼び出してはならない。必ず `StudentAggregate.decideHouse()` を経由する。

## リポジトリ

### StudentRepository（インターフェース）

```ts
interface StudentRepository {
  findById(id: StudentId): Promise<StudentAggregate | null>;
  save(student: StudentAggregate): Promise<void>;
}
```

- 具象実装 `FirebaseStudentRepository`（`infrastructure/firebase/`）は現時点で未実装（`findById` / `save` ともにスタブで例外を投げる）。Firestoreの `students` / `manaQualities` 相当のコレクション構成確定後に実装する。

## ユースケース

### AssignHouse

```ts
class AssignHouse {
  constructor(studentRepository: StudentRepository);
  execute(studentId: StudentId): Promise<House>;
}
```

フロー: `studentRepository.findById` → 存在しなければ例外 → `student.decideHouse()` → `studentRepository.save(student)` → 判定結果の `House` を返す。

## テスト不変条件チェックリスト（未着手）

現時点でユニットテストは存在しない。品質ゲート（`CLAUDE.md` の開発の掟）を満たすため、少なくとも以下をテストで証明する必要がある:

- [ ] `ManaQuality.create` は `order` / `chaos` / `amount` のいずれかが `0未満` または `100超` のとき例外を投げる。
- [ ] `ManaQuality.create` は範囲内（境界値 `0` と `100` を含む）であれば正常に生成できる。
- [ ] `StudentId.fromString("")` および空白のみの文字列は例外を投げる。
- [ ] `order >= chaos` の `ManaQuality` を持つ生徒は `decideHouse()` で必ず `RegiusCardis` に配属される（境界値 `order === chaos` を含む）。
- [ ] `chaos > order` の `ManaQuality` を持つ生徒は `decideHouse()` で必ず `RoseSleep` に配属される。
- [ ] `decideHouse()` 実行後、`StudentAggregate.house` が確定した学舎と一致する。
- [ ] `AssignHouse.execute` は存在しない `StudentId` に対して例外を投げる。
- [ ] `AssignHouse.execute` は判定後に `studentRepository.save` を1回呼び出す。
