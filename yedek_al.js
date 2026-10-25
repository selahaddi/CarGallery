import fs from 'fs';
import path from 'path';

const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxd3Zsb3hpbnZieGlhaXdhbGNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY5Njk3MywiZXhwIjoyMDkyMjcyOTczfQ.H5juOqGYlHUoVl6NZRgfTPCWVszkVsNDtZHwhonB_pA";
const url = "https://pqwvloxinvbxiaiwalcg.supabase.co/rest/v1/";

const backupDir = path.join(process.cwd(), 'yedekler');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function jsonToCsv(items) {
  if (!items || !items.length) return "";
  const headers = Object.keys(items[0]);
  const csvRows = [headers.join(",")];
  for (const row of items) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") val = JSON.stringify(val);
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}

function jsonToSql(tableName, items) {
  if (!items || !items.length) return `-- No data for ${tableName}\n`;
  let sql = `-- Backup for table: ${tableName}\n`;
  for (const row of items) {
    const keys = Object.keys(row);
    const cols = keys.map(k => `"${k}"`).join(", ");
    const vals = keys.map(k => {
      let val = row[k];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "number" || typeof val === "boolean") return val;
      if (typeof val === "object") val = JSON.stringify(val);
      return `'${String(val).replace(/'/g, "''")}'`;
    }).join(", ");
    sql += `INSERT INTO "${tableName}" (${cols}) VALUES (${vals});\n`;
  }
  return sql + "\n";
}

async function runBackup() {
  const tables = ["contents", "offers", "bekleyen_teklifler", "weddings", "guests", "gallery_photos", "song_requests"];
  const fullBackup = {};
  let fullSql = `-- SUPABASE DATABASE BACKUP\n-- Generated on ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    try {
      const res = await fetch(`${url}${table}?select=*`, {
        headers: { "apikey": key, "Authorization": `Bearer ${key}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        fullBackup[table] = data;
        fs.writeFileSync(path.join(backupDir, `${table}.csv`), jsonToCsv(data));
        fs.writeFileSync(path.join(backupDir, `${table}.json`), JSON.stringify(data, null, 2));
        fullSql += jsonToSql(table, data);
        console.log(`Saved ${table}: ${data.length} rows`);
      }
    } catch(err) {
      console.error(`Error table ${table}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(backupDir, "tam_yedek.json"), JSON.stringify(fullBackup, null, 2));
  fs.writeFileSync(path.join(backupDir, "veritabani_yedek.sql"), fullSql);
  console.log("ALL BACKUPS SUCCESSFULLY SAVED IN: " + backupDir);
}

runBackup();
