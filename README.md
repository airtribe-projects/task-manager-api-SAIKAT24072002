# Task Manager API

A REST API for creating and managing tasks. It starts with the records in `task.json` and stores every runtime change in JavaScript memory.

## Features

- Create, list, retrieve, replace, and delete tasks
- Filter tasks by completion status
- Strict task and query validation
- Consistent JSON errors for invalid input, missing resources, and server failures
- Configurable server port without opening a listener when tests import the app

## Technology

- Node.js 18 or newer
- Express.js 4
- Tap and Supertest for tests
- In-memory JavaScript storage (no database)

## Installation and use

```bash
npm install
npm start
```

The server uses port `3000` by default. Set `PORT` to use another port:

```bash
PORT=4000 npm start
```

Run the test suite with:

```bash
npm run test
```

## API endpoints

| Method | Endpoint | Description | Success |
| --- | --- | --- | --- |
| POST | `/tasks` | Create a task | `201` |
| GET | `/tasks` | List all tasks | `200` |
| GET | `/tasks?completed=true` | List completed tasks | `200` |
| GET | `/tasks?completed=false` | List incomplete tasks | `200` |
| GET | `/tasks/:id` | Retrieve one task | `200` |
| PUT | `/tasks/:id` | Fully replace one task | `200` |
| DELETE | `/tasks/:id` | Delete one task | `200` |

## Request and response examples

A task body must contain all three fields. `title` and `description` must be non-empty strings, while `completed` must be a JSON boolean.

```json
{
  "title": "Write API documentation",
  "description": "Add endpoint and error examples",
  "completed": false
}
```

Creating that task returns `201 Created` and a unique numeric ID:

```json
{
  "id": 16,
  "title": "Write API documentation",
  "description": "Add endpoint and error examples",
  "completed": false
}
```

A successful `PUT /tasks/16` requires the same complete body and returns the replaced task. A successful `DELETE /tasks/16` returns the deleted task.

## curl examples

```bash
curl http://localhost:3000/tasks

curl "http://localhost:3000/tasks?completed=false"

curl http://localhost:3000/tasks/1

curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Review code","description":"Review the task API","completed":false}'

curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Review code","description":"Finish the review","completed":true}'

curl -X DELETE http://localhost:3000/tasks/1
```

## Validation and errors

Validation failures return `400 Bad Request` in a consistent format:

```json
{
  "error": "completed is required and must be a boolean"
}
```

The strings `"true"` and `"false"` are not valid values for the `completed` task field. Filtering accepts only the exact query values `true` or `false`; for example, `/tasks?completed=yes` returns `400`.

Missing tasks and unknown routes return `404`. Unexpected errors are handled centrally and return `500`. All error responses use an object with an `error` string.

## Storage limitation

The API does not use a database. `task.json` is read only as initial seed data, and additions, updates, and deletions live only in the current Node.js process. Restarting the server resets all tasks to the seed data.

## Project structure

```text
.
|-- app.js              # Express app, routes, validation, and server startup
|-- task.json           # Initial task data
|-- test/
|   `-- server.test.js  # API test suite
|-- package.json        # Scripts and dependencies
|-- package-lock.json   # Locked dependency tree
|-- .gitignore          # Ignored generated files
`-- README.md           # Project documentation
```
