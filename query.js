const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or open the SQLite database file
const dbPath = path.join(__dirname, "your-database.db");
const db = new sqlite3.Database(dbPath);

const query = 
`SELECT id, kanjis, kanas, meanings, tags 
FROM Words 
WHERE kanjis 
LIKE ? 
OR kanas 
LIKE ? 
OR kanas
LIKE ? 
OR meanings 
LIKE ?`;

// data for search:
// CDプレーヤー, CDプレイヤー  [シーディープレーヤー, シーディープレイヤー]
// CD Player
// tags

// case insensitive
const meaningQueryString = "cd player";
const hiraganaReadingQueryString = "しくじる"
const katakanaReadingQueryString = "アイヌ"
const kanjiWordQueryString = "其れ" 


// kanjis kanas meanings
db.all(query, [`%${kanjiWordQueryString}%`, `%${hiraganaReadingQueryString}%`, `%${katakanaReadingQueryString}%`, `%${meaningQueryString}%`], (err, rows) => {
    if (err) {
        console.error("Error executing query:", err.message);
    } else {
        if (rows.length > 0) {
            console.log("Results:", rows, `Number of results: ${rows.length}`);
        } else {
            console.log(
                `No entry found`
            );
        }
    }

    // Close the database connection
    db.close((closeErr) => {
        if (closeErr) {
            return console.error(
                "Error closing database connection:",
                closeErr.message
            );
        }
        console.log("Database connection closed.");
    });
});
