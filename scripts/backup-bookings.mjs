import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = process.env.BOOKING_DATABASE_PATH || "/data/optidigi.sqlite";
const backupDirectory = join(dirname(databasePath), "backups");
mkdirSync(backupDirectory, { recursive: true });

const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const destination = join(backupDirectory, `optidigi-${timestamp}.sqlite`);
const escapedDestination = destination.replaceAll("'", "''");

const database = new DatabaseSync(databasePath, { readOnly: true });
database.exec(`VACUUM INTO '${escapedDestination}'`);
database.close();

const retentionCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
for (const filename of readdirSync(backupDirectory)) {
  const path = join(backupDirectory, filename);
  if (filename.endsWith(".sqlite") && statSync(path).mtimeMs < retentionCutoff) unlinkSync(path);
}

console.log(destination);
