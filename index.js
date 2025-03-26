require('dotenv').config(); 


const express = require('express');
const cors = require('cors');           
const mongoose = require('mongoose');
const Task = require('./models/task.js');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());                       
app.use(express.json());


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('✅ API is live');
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    console.log('📥 Received POST /api/tasks:', req.body);
    const { title } = req.body;
    const newTask = await Task.create({ title, completed: false });
    console.log('✅ Saved task to MongoDB:', newTask);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('❌ Error saving task:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
