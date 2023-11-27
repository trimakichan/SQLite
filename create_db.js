const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

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
        id TEXT PRIMARY KEY
        )
    `);

    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS Kanji (
        id TEXT PRIMARY KEY,
        entry_id TEXT,
        common INTEGER,
        text TEXT,
        FOREIGN KEY (entry_id) REFERENCES Words(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Kana (
        id TEXT PRIMARY KEY,
        entry_id TEXT,
        common INTEGER,
        text TEXT,
        FOREIGN KEY (entry_id) REFERENCES Words(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Sense (
        id TEXT PRIMARY KEY,
        entry_id TEXT,
        gloss TEXT,
        FOREIGN KEY (entry_id) REFERENCES Words(id)
    )`);


    // Insert data into the table
    jsonData.forEach((entry) => {
        db.run(`INSERT INTO Words (id) VALUES (?)`, [entry.id], (err) => {
            if (err) {
                console.error(
                    `Error inserting word ${entry.id} into table Words:`,
                    err.message
                );
            } else {
                console.log(`Inserted word ${entry.id} into Words`);
            }
        });

        // Inset kanji into Kanji table
        entry.kanji.forEach((kanji, kanjiIndex) => {
            const kanji_id = `${entry.id}_kanji_${kanjiIndex}`;

            db.run(
                `INSERT INTO Kanji (id, entry_id, common, text) VALUES (?, ?, ?, ?)`,
                [kanji_id, entry.id, kanji.common, kanji.text],
                (err) => {
                    if (err) {
                        console.error(
                            `Error inserting kanji ${kanji_id} (word ${entry.id}) into table Kanji:`,
                            err.message
                        );
                    } else {
                        console.log(
                            `Inserted kanji ${kanji_id} (word ${entry.id}) into table Kanji`
                        );
                    }
                }
            );
        });

        // Inset kana into Kana table
        entry.kana.forEach((kana, kanaIndex) => {
            const kana_id = `${entry.id}_kana_${kanaIndex}`;

            db.run(
                `INSERT INTO Kana (id, entry_id, common, text) VALUES (?, ?, ?, ?)`,
                [kana_id, entry.id, kana.common, kana.text],
                (err) => {
                    if (err) {
                        console.error(
                            `Error inserting kana ${kana_id} (word ${entry.id}) into table Kana:`,
                            err.message
                        );
                    } else {
                        console.log(
                            `Inserted kana ${kana_id} (word ${entry.id}) into table Kana`
                        );
                    }
                }
            );
        });


        entry.sense.forEach((sense, senseIndex) => {
            const sense_id = `${entry.id}_sense_${senseIndex}`;
            // may have bug parsing back into an array in the app if gloss.text contains a comma in it
            const gloss = sense.gloss.map(glossObj => glossObj.text).join("$ ")

            db.run(
                `INSERT INTO Sense (id, entry_id, gloss) VALUES (?, ?, ?)`,
                [sense_id, entry.id, gloss],
                (err) => {
                    if (err) {
                        console.error(
                            `Error inserting sense ${sense_id} (word ${entry.id}) into table Sense:`,
                            err.message
                        );
                    } else {
                        console.log(
                            `Inserted kana ${sense_id} (word ${entry.id}) into table Sense`
                        );
                    }
                }
            );
        })

        // entry.sense.forEach((sense) => {
        //   db.run(
        //     `INSERT INTO Sense (entry_id, part_of_speech, related, antonym, field, dialect, misc, info, languageSource) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        //     [
        //       entry.id,
        //       sense.part_of_speech,
        //       sense.related,
        //       sense.antonym,
        //       sense.field,
        //       sense.dialect,
        //       sense.misc,
        //       sense.info,
        //       sense.languageSource,
        //     ],
        //     (err) => {
        //       if (err) {
        //         console.error("Error inserting data:", err.message);
        //       } else {
        //         console.log(`Data inserted for ID ${entry.id}`);
        //       }
        //     }
        //   );

        //   sense.gloss.forEach((gloss) => {
        //     db.run(
        //       `INSERT INTO Gloss (id, sense_id, lang, text) VALUES (?, ?, ?, ?)`,
        //       [entry.id, sense.id, gloss.lang, gloss.text],
        //       (err) => {
        //         if (err) {
        //           console.error("Error inserting data:", err.message);
        //         } else {
        //           console.log(`Data inserted for ID ${entry.id}`);
        //         }
        //       }
        //     );
        //   });
        // });
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error("Error closing database connection:", err.message);
    }
    console.log("Database connection closed.");
});