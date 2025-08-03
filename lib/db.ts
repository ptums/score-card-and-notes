// src/services/db.ts
import Dexie, { Table } from "dexie";

export interface Course {
  id?: number;
  name: string;
  rounds: 9 | 18;
}

export interface Game {
  id?: number;
  date: Date;
  courseId: number;
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

export class AppDB extends Dexie {
  courses!: Table<Course, number>;
  games!: Table<Game, number>;
  scores!: Table<Score, number>;

  constructor() {
    super("ScoreCardNotes");

    this.version(1).stores({
      courses: "++id, name, rounds",
      games: "++id, date, courseId",
      scores: "++id, gameId, hole, rating",
    });

    this.version(2).stores({
      courses: "++id, name, rounds",
      games: "++id, date, courseId, finalNote, finalScore",
      scores: "++id, gameId, hole, rating",
    });

    this.version(3).stores({
      courses: "++id, name, rounds",
      games: "++id, date, courseId, finalNote, finalScore, scores",
      scores: "++id, gameId, hole, rating",
    });

    // New version removing user/account dependency
    this.version(4).stores({
      courses: "++id, name, rounds",
      games: "++id, date, courseId, finalNote, finalScore",
      scores: "++id, gameId, hole, rating",
    });
  }
}

export const db = new AppDB();
