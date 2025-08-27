/* 
    Express server that listens on port 3001
    API endpoints that handle task operations:

    GET /api/tasks - Retrieve all tasks
    GET /health - Health check endpoint
    POST /api/tasks - Create a new task
    PUT /api/tasks/:id/toggle - Mark task complete/incomplete
    DELETE /api/tasks/:id - Remove a task

    MongoDB connection using Mongoose
    CORS enabled so frontend can communicate with backend
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/taskmanager';

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Security headers

// Request logging middleware
app.use((req, res, next) => {
    logger.info('API Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

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
        logger.info('Database connected', {
            database: 'MongoDB',
            uri: MONGODB_URI.replace(/\/\/.*@/, '//***@') // Hide credentials in logs
        });
    })
    .catch((error) => {
        logger.error('Database connection failed', {
            error: error.message,
            uri: MONGODB_URI.replace(/\/\/.*@/, '//***@')
        });
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

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: 'connected'
        };

        logger.info('Health check passed', healthData);
        res.status(200).json(healthData);
    } catch (error) {
        const errorData = {
            status: 'unhealthy',
            error: error.message
        };

        logger.error('Health check failed', errorData);
        res.status(503).json(errorData);
    }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        logger.info('Tasks retrieved', { count: tasks.length });
        res.json(tasks);
    } catch (error) {
        logger.error('Error retrieving tasks', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Create a task
app.post('/api/tasks', async (req, res) => {
    try {
        const { text } = req.body;
        const task = new Task({ text });
        const savedTask = await task.save();

        logger.info('Task created', {
            taskId: savedTask._id,
            text: savedTask.text
        });

        res.status(201).json(savedTask);
    } catch (error) {
        logger.error('Error creating task', {
            error: error.message,
            requestBody: req.body
        });
        res.status(400).json({ error: error.message });
    }
});

// Toggle task completion
app.put('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            logger.warn('Task not found for toggle', { taskId: req.params.id });
            return res.status(404).json({ error: 'Task not found' });
        }

        task.completed = !task.completed;
        const updatedTask = await task.save();

        logger.info('Task toggled', {
            taskId: updatedTask._id,
            completed: updatedTask.completed
        });

        res.json(updatedTask);
    } catch (error) {
        logger.error('Error toggling task', {
            error: error.message,
            taskId: req.params.id
        });
        res.status(400).json({ error: error.message });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            logger.warn('Task not found for deletion', { taskId: req.params.id });
            return res.status(404).json({ error: 'Task not found' });
        }

        logger.info('Task deleted', {
            taskId: deletedTask._id,
            text: deletedTask.text
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        logger.error('Error deleting task', {
            error: error.message,
            taskId: req.params.id
        });
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
});