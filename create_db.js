const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const uniq = require("lodash/uniq")

// Path to your JSON file
const jsonFilePath = "./jmdict-eng-common-3.5.0.json";

// Read JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Create or open the SQLite database file
const dbPath = path.join(__dirname, "your-database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Words (
        id TEXT PRIMARY KEY,
        entry_data TEXT,
        kanjis TEXT,
        kanas TEXT,
        meanings TEXT,
        tags TEXT
        )
    `);
    console.log("Created table Words")

    // Insert data into the table
    jsonData.forEach((entry) => {
        const { id } = entry
        const entry_data = JSON.stringify(entry)
        const kanjis = entry.kanji.map(kanji => kanji.text).join("$ ")
        const kanas = entry.kana.map(kana => kana.text).join("$ ")
        const meanings = entry.sense.map(sense =>
            sense.gloss.map(gloss => gloss.text).join("$ ")
        ).join("")

        const allTags = entry.sense.flatMap(sense => 
            [...sense.field, ...sense.dialect, ...sense.misc])

        if ([...entry.kanji, ...entry.kana].some(obj => obj.common)) {
            allTags.push("common")
        }

        const uniqueTags = uniq(tags).join("$ ")

        db.run(`INSERT INTO Words (id, entry_data, kanjis, kanas, meanings, tags) VALUES (?, ?, ?, ?, ?, ?)`, [id, entry_data, kanjis, kanas, meanings, uniqueTags], (err) => {
            if (err) {
                console.error(
                    `Error inserting word ${id} into table Words:`,
                    err.message
                );
            } else {
                console.log(`Inserted word ${id} into Words`);
            }
        });
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error("Error closing database connection:", err.message);
    }
    console.log("Database connection closed.");
});
