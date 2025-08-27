/* 
    Express server that listens on port 3001
    API endpoints that handle task operations:

    GET /api/tasks - Retrieve all tasks
    Get /health - Health check endpoint
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

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Security headers

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

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

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

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
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

app.use('/api/', limiter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Backend container is ready!');
});