// load books from json files
const fs = require("fs");
const fsp = require("fs").promises;
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

let timeout;

const debounce = (fn, delay = 500) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fn();
  }, delay);
};

const saveBooks = async () => {
  try {
    await fsp.promises.writeFile(
      filePath,
      JSON.stringify(books, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Error saving books:", error);
  }
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

app.post("/books", async (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    const error = "Title and the author are required.";
    return res.status(400).json({ error });
  }

  //check for duplicates first
  const isDuplicate = books.some(
    (book) =>
      book.title.toLowerCase() === title.toLowerCase() &&
      book.author.toLowerCase() === author.toLowerCase(),
  );

  if (isDuplicate) {
    return res
      .status(409)
      .json({ error: "This book already exists in the library" });
  }

  const newBook = {
    id: Date.now().toString(),
    title,
    author,
  };

  books.push(newBook);
  res.status(201).json(newBook);
  debounce(saveBooks);
});

app.put("/books/:id", async (req, res) => {
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
  debounce(saveBooks);
});

app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;
  const index = books.findIndex((book) => id === book.id);
  if (index === -1) {
    const error = "Book not found";
    return res.status(404).json({ error });
  }

  const deleted = books.splice(index, 1);
  res.json(deleted);
  debounce(saveBooks);
});

app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
