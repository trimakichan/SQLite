const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Path to your JSON file
const jsonFilePath = './jmdict-eng-common-3.5.0.json';

// Path to the SQLite database file
const dbFilePath = './database.db';

// Read JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Open SQLite database
const db = new sqlite3.Database(dbFilePath);

console.log('SQL Statement:', 'CREATE TABLE IF NOT EXISTS words ...');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY
    )
  `);

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS kanji (
  //     word_id INTEGER,
  //     common INTEGER,
  //     text TEXT,
  //     tags TEXT,
  //     PRIMARY KEY (word_id, text),
  //     FOREIGN KEY (word_id) REFERENCES words (id)
  //   )
  // `);

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS kana (
  //     word_id INTEGER,
  //     common INTEGER,
  //     text TEXT,
  //     tags TEXT,
  //     PRIMARY KEY (word_id, text),
  //     FOREIGN KEY (word_id) REFERENCES words (id)
  //   )
  // `);

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS sense (
  //     word_id INTEGER,
  //     partOfSpeech TEXT,
  //     related TEXT,
  //     antonym TEXT,
  //     field TEXT,
  //     dialect TEXT,
  //     misc TEXT,
  //     info TEXT,
  //     languageSource TEXT,
  //     gloss_lang TEXT,
  //     gloss_text TEXT,
  //     PRIMARY KEY (word_id, partOfSpeech),
  //     FOREIGN KEY (word_id) REFERENCES words (id)
  //   )
  // `);

  // Insert data
  const stmtWord = db.prepare('INSERT INTO words (id) VALUES (?)');
  // const stmtKanji = db.prepare('INSERT INTO kanji (word_id, common, text, tags) VALUES (?, ?, ?, ?)');
  // const stmtKana = db.prepare('INSERT INTO kana (word_id, common, text, tags) VALUES (?, ?, ?, ?)');
  // const stmtSense = db.prepare('INSERT OR IGNORE INTO sense (word_id, partOfSpeech, related, antonym, field, dialect, misc, info, languageSource, gloss_lang, gloss_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');


  jsonData.forEach((data) => {
    stmtWord.run([data.id]);

    // if (data.kanji) {
    //   data.kanji.forEach((k) => {
    //     stmtKanji.run([data.id, k.common, k.text, k.tags.join(', ')]);
    //   });
    // }

    // if (data.kana) {
    //   data.kana.forEach((k) => {
    //     stmtKana.run([data.id, k.common, k.text, k.tags.join(', ')]);
    //   });
    // }

    // if (data.sense) {
    //   data.sense.forEach((s) => {
    //     if (s.gloss) {
    //       s.gloss.forEach((g) => {
    //         stmtSense.run([data.id, s.partOfSpeech, s.related.join(', '), s.antonym.join(', '), s.field.join(', '), s.dialect.join(', '), s.misc.join(', '), s.info.join(', '), s.languageSource.join(', '), g.lang, g.text]);
    //       });
    //     } else {
    //       stmtSense.run([data.id, s.partOfSpeech, s.related.join(', '), s.antonym.join(', '), s.field.join(', '), s.dialect.join(', '), s.misc.join(', '), s.info.join(', '), s.languageSource.join(', '), null, null]);
    //     }
    //   });
    // }
  });

  stmtWord.finalize();
  // stmtKanji.finalize();
  // stmtKana.finalize();
  // stmtSense.finalize();
});

// Close the database connection
db.close();
