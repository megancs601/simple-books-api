import cors from "cors";
import "dotenv/config";
import express, { json } from "express";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool();

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const client = await pool.connect();

// REST API
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://megancs601.github.io",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(json());

app.get("/", (req, res) => {
  res.send("📚 Book API is running. Use /books");
});

app.get("/books", async (req, res) => {
  const books = await client.query("SELECT * FROM books");
  res.status(200).json(books.rows);
});

app.post("/books", async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    const error = "Both book title and author are required.";
    return res.status(400).json({ error });
  }

  try {
    const isDuplicate = await isDuplicateBook({ title, author });
    if (isDuplicate) {
      return res
        .status(409)
        .json({ error: "This book already exists in the library." });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }

  const query = {
    text: "INSERT INTO books(title, author) VALUES($1, $2)",
    values: [title, author],
  };

  await client.query(query);
  res.status(201).end();
});

app.patch("/books/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;

  if (!title || !author) {
    const error = "Both book title and author are required.";
    return res.status(400).json({ error });
  }

  try {
    const isDuplicate = await isDuplicateBook({ title, author });
    if (isDuplicate) {
      return res
        .status(409)
        .json({ error: "This book already exists in the library." });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }

  const query = {
    text: "UPDATE books SET title=$1, author=$2 WHERE id=$3",
    values: [title, author, id],
  };

  const result = await client.query(query);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Book not found" });
  }

  res.status(204).end();
});

app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;

  const query = {
    text: "DELETE FROM books WHERE id = $1",
    values: [id],
  };
  const result = await client.query(query);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "book not found" });
  }

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});

const isDuplicateBook = async ({ title, author }) => {
  try {
    const query = {
      text: "SELECT 1 FROM books WHERE LOWER(title) = $1 AND LOWER(author) = $2 LIMIT 1",
      values: [title.toLowerCase(), author.toLowerCase()],
    };
    const result = await client.query(query);
    return result.rowCount > 0;
  } catch (e) {
    console.error("Error checking for duplicate book:", e);
    throw e;
  }
};
