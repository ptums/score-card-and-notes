// src/services/db.ts
import Dexie, { Table } from "dexie";

export interface User {
  id?: number;
  account: string;
  game: Game[];
}

export interface Course {
  id?: number;
  name: string;
  rounds: 9 | 18;
}

export interface Game {
  id?: number;
  date: Date;
  courseId: number;
  userId: number;
  finalNote: string;
  finalScore: number;
  scores: Score[];
}

export interface Score {
  id?: number;
  gameId: number;
  hole: number;
  par: string;
  score: string;
  rating: 0 | 1 | 2 | 3 | 4;
}

export interface Range {
  id?: number;
  userId: number;
  name: number;
  yards: string;
  rating: 0 | 1 | 2 | 3 | 4;
}

export class AppDB extends Dexie {
  users!: Table<User, number>;
  courses!: Table<Course, number>;
  games!: Table<Game, number>;
  scores!: Table<Score, number>;
  ranges: Table<Range, number> | undefined;

  constructor() {
    super("ScoreCardNotes");

    // version 1: basic tables
    this.version(1).stores({
      users: "++id, account, game",
      courses: "++id, name, rounds",
      games: "++id, date, courseId, userId",
      scores: "++id, gameId, hole",
      ranges: "++id, userId, name, yards, rating",
    });

    // version 2: add full text fields for queries (no array fields)
    this.version(2)
      .stores({
        users: "++id, account, game",
        courses: "++id, name, rounds",
        games: "++id, date, courseId, userId, finalNote, finalScore",
        scores: "++id, gameId, hole, par, score, rating",
        ranges: "++id, userId, name, yards, rating",
      })
      .upgrade(() => {
        // Optional: migrate existing records to include default finalNote/finalScore/par/score, etc.
      });
  }
}

export const db = new AppDB();
