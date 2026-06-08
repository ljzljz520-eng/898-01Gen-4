import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

export function run(sql: string, params: any[] = []): Promise<number> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

export function get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function all<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, _reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar VARCHAR(255),
          is_verified BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          hardware_type VARCHAR(20) NOT NULL,
          firmware_version VARCHAR(50),
          tags TEXT,
          status VARCHAR(20) DEFAULT 'open',
          answer_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          accepted_answer_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          is_verified BOOLEAN DEFAULT 0,
          verified_by INTEGER,
          is_accepted BOOLEAN DEFAULT 0,
          vote_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (verified_by) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER,
          answer_id INTEGER,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(20) NOT NULL,
          file_size INTEGER NOT NULL,
          license VARCHAR(50) NOT NULL,
          download_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id),
          FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS knowledge_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          answer_id INTEGER NOT NULL,
          title VARCHAR(200) NOT NULL,
          summary TEXT NOT NULL,
          tags TEXT,
          hardware_type VARCHAR(20) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id),
          FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          answer_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          direction INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(answer_id, user_id),
          FOREIGN KEY (answer_id) REFERENCES answers(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      db.run(`CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_questions_hardware_type ON questions(hardware_type)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_knowledge_hardware_type ON knowledge_entries(hardware_type)`);

      console.log('Database tables created successfully');
      resolve();
    });
  });
}

export default db;
