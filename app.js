const express = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// safer id generator (handles deletions)
let nextId = todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1;

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

// GET completed (kept from your original code)
app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.status(200).json(completed); // Custom Read!
});

// GET active (not completed) – Bonus requirement
app.get('/todos/active', (req, res) => {
  const active = todos.filter((t) => !t.completed);
  res.status(200).json(active);
});

// GET single by id – Read (required by assignment)
// Note: placed after static routes like /completed and /active
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.status(200).json(todo);
});

// Middleware to validate POST body requires "task"
function requireTaskField(req, res, next) {
  const task = req.body && req.body.task;
  if (typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({ error: '"task" field is required and must be a non-empty string.' });
  }
  // normalize task
  req.body.task = task.trim();
  next();
}

// POST New – Create (now requires "task")
app.post('/todos', requireTaskField, (req, res) => {
  const { task, completed = false } = req.body;
  const newTodo = { id: nextId++, task, completed: Boolean(completed) };
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
});

// PATCH Update – Partial (validate task if provided)
app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const todo = todos.find((t) => t.id === id); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });

  if (req.body.task !== undefined) {
    if (typeof req.body.task !== 'string' || req.body.task.trim() === '') {
      return res.status(400).json({ error: '"task" must be a non-empty string when provided.' });
    }
    todo.task = req.body.task.trim();
  }

  if (req.body.completed !== undefined) {
    todo.completed = Boolean(req.body.completed);
  }

  res.status(200).json(todo);
});

// DELETE Remove
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error!' });
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
