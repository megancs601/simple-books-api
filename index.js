const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let books = [];

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
});

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
