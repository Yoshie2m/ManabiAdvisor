export const SUBJECTS = ["English", "Math", "Japanese", "Science", "SocialStudies"] as const;

export type Subject = (typeof SUBJECTS)[number];

export function isSubject(value: string): value is Subject {
  return (SUBJECTS as readonly string[]).includes(value);
}
