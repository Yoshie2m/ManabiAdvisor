export class StudentId {
  private constructor(private readonly value: string) {}

  static fromString(value: string): StudentId {
    if (value.trim().length === 0) {
      throw new Error("StudentId must not be empty");
    }
    return new StudentId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: StudentId): boolean {
    return this.value === other.value;
  }
}
