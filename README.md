### Description

Small REST API in Node.js that allows user to add, delete and list books. No database. Just an in memory array of books to focus on core logic.

### Tools

- Node.js
- Express.js (framework to help create APIs)
- nodemon (optional: restarts server when code changes)
- cURL (for testing the endpoints)

### Installing packages and starting localhost

```
pnpm install
```

```
pnpm run start
```

### Test the API using curl

- What is curl?
  - curl is a command-line tool to send HTTP requests. It allows you to test your API without needing a browser.
- `-H` stands for header. You use it to send extra info w/ your request
  - `-H "content-type: application/json"` this tells the server you are sending JSON data in the request/body. Without it, the server wont know how to parse the data correctly.
- `-X` tells curl what method to use.
  - `-X POST`
    - NEEDS a header afterwards.
  - `-X DELETE`
    - Does NOT need a header afterwards.
- `-d` is the actual data.

#### Add Book

```
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title": "book title", "author": "first and last name"}'
```

#### Delete Book

```
curl -X DELETE http://localhost:3000/books/<book-id>
```

#### Edit Book

```
curl -X PUT http://localhost:3000/books/<book-id>
  -H "Content-Type: application/json" \
  -d '{"title": "updated title", "author": "updated name"}'
```
