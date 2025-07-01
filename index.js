// load books from json files
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "books.json");

let books = [];

if (fs.existsSync(filePath)) {
  const data = fs.readFileSync(filePath, "utf8");
  try {
    books = JSON.parse(data);
  } catch (error) {
    console.error("Error parsing books.json", error);
  }
}

const saveBooks = () => {
  fs.writeFileSync(filePath, JSON.stringify(books, null, 2), "utf-8");
};

// REST API
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("📚 Book API is running. Use /books");
});

app.get("/books", (req, res) => {
  res.json(books);
});

app.post("/books", (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    const error = "Title and the author are required.";
    return res.status(400).json({ error });
  }

  const newBook = {
    id: Date.now().toString(),
    title,
    author,
  };

  books.push(newBook);
  res.status(201).json(newBook);
  saveBooks();
});

app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;
  const index = books.findIndex((book) => id === book.id);
  if (index === -1) {
    return res.status(404).json({ error: "Book not found." });
  }

  if (title !== undefined) {
    books[index].title = title;
  }

  if (author !== undefined) {
    books[index].author = author;
  }

  res.status(200).json(books[index]);
  saveBooks();
});

app.delete("/books/:id", (req, res) => {
  const { id } = req.params;
  const index = books.findIndex((book) => id === book.id);
  if (index === -1) {
    const error = "Book not found";
    return res.status(404).json({ error });
  }

  const deleted = books.splice(index, 1);
  res.json(deleted);
  saveBooks();
});

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
