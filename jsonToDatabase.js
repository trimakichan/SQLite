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
    part_of_speech TEXT,
    related TEXT,
    antonym TEXT,
    field TEXT,
    dialect TEXT,
    misc TEXT,
    info TEXT,
    languageSource TEXT,
    FOREIGN KEY (entry_id) REFERENCES Words(id)
)`);

  db.run(`CREATE TABLE IF NOT EXISTS Gloss (
        id TEXT PRIMARY KEY,
        sense_id TEXT,
        lang TEXT,
        text TEXT,
        FOREIGN KEY (sense_id) REFERENCES Sense(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS AppliesToKanji (
        kanji_id INTEGER,
        kana_id INTEGER,
        FOREIGN KEY (kanji_id) REFERENCES Kanji(id),
        FOREIGN KEY (kana_id) REFERENCES Kana(id)
    )`);

  // Insert data into the table
  jsonData.forEach((entry) => {
    db.run(`INSERT INTO Words (id) VALUES (?)`, [entry.id], (err) => {
      if (err) {
        console.error("Error inserting data:", err.message);
      } else {
        console.log(`Data inserted for ID ${entry.id}`);
      }
    });

    entry.kanji.forEach((kanji, index) => {
      db.run(
        `INSERT INTO Kanji (id, entry_id, common, text) VALUES (?, ?, ?, ?)`,
        [`${entry.id}_kanji_${index}`, entry.id, kanji.common, kanji.text],
        (err) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          } else {
            console.log(`Data inserted for ID ${entry.id}`);
          }
        }
      );
    });

    entry.kana.forEach((kana, index) => {
      db.run(
        `INSERT INTO Kana (id, entry_id, common, text) VALUES (?, ?, ?, ?)`,
        [`${entry.id}_kana_${index}`, entry.id, kana.common, kana.text],
        (err) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          } else {
            console.log(`Data inserted for ID ${entry.id}`);
          }
        }
      ); 

      if(kana.appliesToKanji.length > 0 && kana.appliesToKanji[0] !== "*") {
        //To do: check all indices appliesToKanji
        let kanji_id = entry.kanji.find(kanji.text === kana.appliesToKanji[0])
      }

      //Insert appliesToKanji with kanji_id if found. Otherwise, it's a "*" or ""
       

    });

    entry.sense.forEach((sense) => {
      db.run(
        `INSERT INTO Sense (entry_id, part_of_speech, related, antonym, field, dialect, misc, info, languageSource) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          sense.part_of_speech,
          sense.related,
          sense.antonym,
          sense.field,
          sense.dialect,
          sense.misc,
          sense.info,
          sense.languageSource,
        ],
        (err) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          } else {
            console.log(`Data inserted for ID ${entry.id}`);
          }
        }
      );

      sense.gloss.forEach((gloss) => {
        db.run(
          `INSERT INTO Gloss (id, sense_id, lang, text) VALUES (?, ?, ?, ?)`,
          [entry.id, sense.id, gloss.lang, gloss.text],
          (err) => {
            if (err) {
              console.error("Error inserting data:", err.message);
            } else {
              console.log(`Data inserted for ID ${entry.id}`);
            }
          }
        );
      });
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
