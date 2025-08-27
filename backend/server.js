/* 
    Express server that listens on port 3001
    API endpoints that handle task operations:

    GET /api/tasks - Retrieve all tasks
    POST /api/tasks - Create a new task
    PUT /api/tasks/:id/toggle - Mark task complete/incomplete
    DELETE /api/tasks/:id - Remove a task


    MongoDB connection using Mongoose
    CORS enabled so frontend can communicate with backend
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/taskmanager';

// Middleware
app.use(cors());
app.use(express.json());

// Task Schema
const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB container');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Task Manager API is running in Docker!',
        endpoints: {
            'GET /api/tasks': 'Get all tasks',
            'POST /api/tasks': 'Create a task',
            'PUT /api/tasks/:id/toggle': 'Toggle task completion',
            'DELETE /api/tasks/:id': 'Delete a task'
        }
    });
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a task
app.post('/api/tasks', async (req, res) => {
    try {
        const { text } = req.body;
        const task = new Task({ text });
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle task completion
app.put('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        task.completed = !task.completed;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Backend container is ready!');
});