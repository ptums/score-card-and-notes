// src/services/db.ts
import Dexie, { Table } from "dexie";

export interface User {
  id?: number;
  account: string;
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
}

export interface Score {
  id?: number;
  gameId: number;
  hole: number;
  par: string;
  score: string;
  rating: 0 | 1 | 2 | 3 | 4;
}

export class AppDB extends Dexie {
  users!: Table<User, number>;
  courses!: Table<Course, number>;
  games!: Table<Game, number>;
  scores!: Table<Score, number>;

  constructor() {
    super("ScoreCardNotes");

    this.version(1).stores({
      users: "++id, account",
      courses: "++id, name, rounds",
      games: "++id, date, courseId, userId",
      scores: "++id, gameId, hole, rating",
    });

    this.version(2).stores({
      users: "++id, account",
      courses: "++id, name, rounds",
      games: "++id, date, courseId, userId, finalNote, finalScore",
      scores: "++id, gameId, hole, rating",
    });
  }
}

export const db = new AppDB();
