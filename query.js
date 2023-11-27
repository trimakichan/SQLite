const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or open the SQLite database file
const dbPath = path.join(__dirname, "your-database.db");
const db = new sqlite3.Database(dbPath);

// Specify the ID you want to query
// const targetId = "求める";

// Query to retrieve the row with the specified ID from the "entries" table
// const query = "SELECT * FROM entries WHERE id = ?";

// Query to retrieve rows where the "fruit" column contains the specified substring
const query = 'SELECT * FROM Sense WHERE gloss LIKE ?';

const searchString = "before";

db.all(query, [`%${searchString}%`], (err, rows) => {
  if (err) {
    console.error("Error executing query:", err.message);
  } else {
    if (rows.length > 0) {
      console.log("Results:", rows);
    } else {
      console.log(
        `No entry found containing the substring "${searchString}" in the 'text' column`
      );
    }
  }
// });

// Execute the query with the specified ID and handle the result
// db.get(query, [targetId], (err, row) => {
//   if (err) {
//     console.error("Error executing query:", err.message);
//   } else {
//     if (row) {
//       console.log("Result:", row);
//     } else {
//       console.log(`No entry found with ID ${targetId}`);
//     }
//   }

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
