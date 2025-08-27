/* 
    Handles user interactions (clicking buttons, pressing Enter)
    Makes HTTP requests to the backend API
    Updates the DOM when tasks are added/completed/deleted
*/

const API_URL = 'http://localhost:3001/api';
let tasks = [];

// Wait for the page to fully load before running our code
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM loaded, initializing app...');

    // Now it's safe to access our elements
    const taskInput = document.getElementById('taskInput');

    if (taskInput) {
        // Add task with Enter key
        taskInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
        console.log('✅ Event listeners added');
    }

    // Load tasks
    loadTasks();
});

async function loadTasks() {
    const taskListElement = document.getElementById('taskList');

    if (!taskListElement) {
        console.error('Task list element not found');
        return;
    }

    try {
        taskListElement.innerHTML = '<div class="loading">🐳 Loading tasks from Docker container...</div>';

        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        taskListElement.innerHTML = `
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
    if (!input) return;

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

    if (!taskList) return;

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