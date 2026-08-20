const express = require("express");
const seedData = require("./task.json");

const app = express();
const DEFAULT_PORT = 3000;

// Copy the seed records so runtime changes never mutate the imported JSON.
const tasks = seedData.tasks.map((task) => ({ ...task }));
let nextId = tasks.reduce((highest, task) => Math.max(highest, task.id), 0) + 1;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sendError = (res, status, message) => res.status(status).json({ error: message });

const parseTaskId = (value) => {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const validateTask = (body) => {
  if (!body || Array.isArray(body) || typeof body !== "object") {
    return "Request body must be a JSON object";
  }
  if (typeof body.title !== "string" || body.title.trim() === "") {
    return "title is required and must be a non-empty string";
  }
  if (typeof body.description !== "string" || body.description.trim() === "") {
    return "description is required and must be a non-empty string";
  }
  if (typeof body.completed !== "boolean") {
    return "completed is required and must be a boolean";
  }

  return null;
};

app.post("/tasks", (req, res) => {
  const validationError = validateTask(req.body);
  if (validationError) {
    return sendError(res, 400, validationError);
  }

  const task = {
    id: nextId++,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    completed: req.body.completed,
  };

  tasks.push(task);
  return res.status(201).json(task);
});

app.get("/tasks", (req, res) => {
  const { completed } = req.query;

  if (completed === undefined) {
    return res.status(200).json(tasks);
  }
  if (Array.isArray(completed) || !["true", "false"].includes(completed)) {
    return sendError(res, 400, "completed query must be true or false");
  }

  const completedValue = completed === "true";
  return res.status(200).json(tasks.filter((task) => task.completed === completedValue));
});

app.get("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  const task = id === null ? undefined : tasks.find((item) => item.id === id);

  if (!task) {
    return sendError(res, 404, "Task not found");
  }
  return res.status(200).json(task);
});

app.put("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  const index = id === null ? -1 : tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return sendError(res, 404, "Task not found");
  }

  const validationError = validateTask(req.body);
  if (validationError) {
    return sendError(res, 400, validationError);
  }

  tasks[index] = {
    id,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    completed: req.body.completed,
  };

  return res.status(200).json(tasks[index]);
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  const index = id === null ? -1 : tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return sendError(res, 404, "Task not found");
  }

  const [deletedTask] = tasks.splice(index, 1);
  return res.status(200).json(deletedTask);
});

app.use((req, res) => sendError(res, 404, "Route not found"));

// Express identifies error middleware by its four-argument signature.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, 400, "Invalid JSON body");
  }

  console.error(err);
  return sendError(res, 500, "Internal server error");
});

if (require.main === module) {
  const requestedPort = Number(process.env.PORT);
  const port =
    process.env.PORT && Number.isInteger(requestedPort) && requestedPort > 0
      ? requestedPort
      : DEFAULT_PORT;

  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

module.exports = app;
