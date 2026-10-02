const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbDirectory = path.resolve(__dirname, "../db");
fs.mkdirSync(dbDirectory, { recursive: true });

const db = new Database("db/banco.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
