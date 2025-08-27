const API_URL = 'http://localhost:3001/api';
let tasks = [];

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Add task with Enter key
document.getElementById('taskInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

async function loadTasks() {
    try {
        document.getElementById('taskList').innerHTML = '<div class="loading">🐳 Loading tasks from Docker container...</div>';

        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        document.getElementById('taskList').innerHTML = `
            <div class="loading">
                ❌ Cannot connect to backend container<br>
                <small>Make sure Docker containers are running</small>
            </div>
        `;
        console.error('Error loading tasks:', error);
    }
}

async function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();

    if (!text) return;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error('Failed to add task');

        input.value = '';
        loadTasks(); // Reload tasks
    } catch (error) {
        alert('Error adding task. Is the backend container running?');
        console.error('Error adding task:', error);
    }
}

async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}/toggle`, {
            method: 'PUT'
        });

        if (!response.ok) throw new Error('Failed to toggle task');

        loadTasks(); // Reload tasks
    } catch (error) {
        console.error('Error toggling task:', error);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        loadTasks(); // Reload tasks
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="loading">No tasks yet. Add one above! 📝</div>';
        return;
    }

    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <span>${task.text}</span>
            <div class="task-actions">
                <button class="btn-small btn-complete" onclick="toggleTask('${task._id}')">
                    ${task.completed ? '↩️' : '✅'}
                </button>
                <button class="btn-small btn-delete" onclick="deleteTask('${task._id}')">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}