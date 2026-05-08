// Types for Math Education Platform

export type Role = 'admin' | 'student';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  gradeLevel?: number;
}

export interface Test {
  id: number;
  title: string;
  grade_level: number;
  duration_minutes: number;
  created_at: string;
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export interface ScoreEntry {
  id: number;
  username: string;
  full_name: string;
  grade_level: number;
  test_title: string;
  score: number;
  completed_at: string;
}
