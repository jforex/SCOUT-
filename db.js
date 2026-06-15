import Database from "better-sqlite3";

const db = new Database("meshscout.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id            TEXT PRIMARY KEY,
    location      TEXT NOT NULL,
    text          TEXT NOT NULL,
    category      TEXT,
    source_device TEXT NOT NULL DEFAULT 'local',
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id            TEXT PRIMARY KEY,
    location      TEXT NOT NULL,
    text          TEXT NOT NULL,
    source_ids    TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_reports_location ON reports(location);
`);

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function addReport({ location, text, category = null, sourceDevice = "local" }) {
  const id = newId();
  db.prepare(
    `INSERT INTO reports (id, location, text, category, source_device, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, location, text, category, sourceDevice, Date.now());
  return id;
}

export function getReportsByLocation(location) {
  return db
    .prepare(`SELECT * FROM reports WHERE location = ? ORDER BY created_at ASC`)
    .all(location);
}

export function getAllReports() {
  return db.prepare(`SELECT * FROM reports ORDER BY created_at ASC`).all();
}

export function getDistinctLocations() {
  return db
    .prepare(`SELECT DISTINCT location FROM reports ORDER BY location ASC`)
    .all()
    .map((r) => r.location);
}

export function saveRecommendation({ location, text, sourceIds }) {
  const id = newId();
  db.prepare(
    `INSERT INTO recommendations (id, location, text, source_ids, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, location, text, JSON.stringify(sourceIds), Date.now());
  return id;
}

export function getRecommendation(location) {
  return db
    .prepare(`SELECT * FROM recommendations WHERE location = ? ORDER BY created_at DESC LIMIT 1`)
    .get(location);
}

export default db;