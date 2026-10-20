import { describe, expect, it } from "vitest";

import { StudentId } from "../../../house-assignment/domain/models/StudentId";
import { QuizSession } from "./QuizSession";

const studentId = StudentId.fromString("student-1");

describe("QuizSession", () => {
  it("starts at index 0 and is not complete", () => {
    const session = QuizSession.start(studentId, "unit-1", 5);
    expect(session.currentIndex).toBe(0);
    expect(session.totalQuestions).toBe(5);
    expect(session.isComplete).toBe(false);
    expect(session.progressRatio).toBe(0);
  });

  it("throws when totalQuestions is not positive", () => {
    expect(() => QuizSession.start(studentId, "unit-1", 0)).toThrow();
    expect(() => QuizSession.start(studentId, "unit-1", -1)).toThrow();
  });

  it("advance() increments currentIndex", () => {
    const session = QuizSession.start(studentId, "unit-1", 2);
    session.advance();
    expect(session.currentIndex).toBe(1);
    expect(session.isComplete).toBe(false);
    expect(session.progressRatio).toBe(0.5);
  });

  it("becomes complete once currentIndex reaches totalQuestions", () => {
    const session = QuizSession.start(studentId, "unit-1", 1);
    session.advance();
    expect(session.isComplete).toBe(true);
    expect(session.progressRatio).toBe(1);
  });

  it("advance() throws once the session is already complete", () => {
    const session = QuizSession.start(studentId, "unit-1", 1);
    session.advance();
    expect(() => session.advance()).toThrow();
  });

  it("reconstruct() trusts the given currentIndex without re-validating", () => {
    const session = QuizSession.reconstruct({ studentId, learningUnitId: "unit-1", totalQuestions: 5, currentIndex: 3 });
    expect(session.currentIndex).toBe(3);
    expect(session.progressRatio).toBe(0.6);
  });
});
