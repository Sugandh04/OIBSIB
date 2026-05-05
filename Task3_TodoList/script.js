// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Data Initialization
// We use a single 'tasks' array now for easier state management with drag-and-drop.
// If the old format exists, clear it to prevent bugs.
if (localStorage.getItem("pending") || localStorage.getItem("completed")) {
    localStorage.removeItem("pending");
    localStorage.removeItem("completed");
}
let tasks = JSON.parse(localStorage.getItem("smart_tasks")) || [];

function save() {
    localStorage.setItem("smart_tasks", JSON.stringify(tasks));
    updateProgress();
}

// === DOM Elements ===
const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priority');
const dueDateInput = document.getElementById('dueDateInput');
const pendingList = document.getElementById('pending');
const completedList = document.getElementById('completed');
const searchInput = document.getElementById('search');
const filterInput = document.getElementById('filter');
const sortInput = document.getElementById('sort');

// === Core Functions ===

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: generateId(),
        text: text,
        priority: priorityInput.value,
        dateAdded: new Date().toISOString(),
        dueDate: dueDateInput.value || null,
        status: 'pending',
        subtasks: []
    };

    tasks.push(newTask);

    // Reset inputs
    taskInput.value = "";
    dueDateInput.value = "";
    priorityInput.value = "medium";

    save();
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
}

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        save();
        render();
    }
}

function addSubtask(taskId, subtaskText) {
    if (!subtaskText.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.subtasks.push({ text: subtaskText, done: false });
        save();
        render();
    }
}

function toggleSubtask(taskId, subtaskIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks[subtaskIndex]) {
        task.subtasks[subtaskIndex].done = !task.subtasks[subtaskIndex].done;
        save();
        render();
    }
}

// === Rendering ===

function formatDate(dateString) {
    if (!dateString) return "";
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function isOverdue(dateString) {
    if (!dateString) return false;
    const due = new Date(dateString);
    due.setHours(23, 59, 59, 999);
    return new Date() > due;
}

const priorityValues = { 'high': 3, 'medium': 2, 'low': 1 };

function render() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterInput.value;
    const sortValue = sortInput.value;

    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    let pendingCount = 0;
    let completedCount = 0;

    // Filter and Sort
    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === 'all' || task.priority === filterValue;
        return matchesSearch && matchesFilter;
    });

    filteredTasks.sort((a, b) => {
        if (sortValue === 'newest') return new Date(b.dateAdded) - new Date(a.dateAdded);
        if (sortValue === 'oldest') return new Date(a.dateAdded) - new Date(b.dateAdded);
        if (sortValue === 'priority') return priorityValues[b.priority] - priorityValues[a.priority];
        if (sortValue === 'dueDate') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
    });

    // Render Tasks
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority} ${task.status}`;
        li.draggable = true;
        li.dataset.id = task.id;

        // Drag events
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);

        // Due date logic
        let dueHtml = '';
        if (task.dueDate) {
            const overdueClass = (isOverdue(task.dueDate) && task.status === 'pending') ? 'overdue' : '';
            dueHtml = `<span class="due-date ${overdueClass}" title="Due Date"><i class="far fa-calendar-alt"></i> ${formatDate(task.dueDate)}</span>`;
        }

        // Subtasks HTML
        let subtasksHtml = '';
        if (task.subtasks.length > 0) {
            subtasksHtml = `
                <div class="subtasks">
                    <ul class="subtask-list">
                        ${task.subtasks.map((st, idx) => `
                            <li class="subtask-item ${st.done ? 'done' : ''}">
                                <input type="checkbox" class="subtask-checkbox" 
                                    ${st.done ? 'checked' : ''} 
                                    onchange="toggleSubtask('${task.id}', ${idx})">
                                <span>${st.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        // Always show the input for adding new subtasks
        subtasksHtml += `
            <div class="add-subtask">
                <input type="text" id="subtask-input-${task.id}" placeholder="Add step..." onkeypress="if(event.key==='Enter') addSubtask('${task.id}', this.value)">
                <button onclick="addSubtask('${task.id}', document.getElementById('subtask-input-${task.id}').value)">Add</button>
            </div>
        `;

        const checkIcon = task.status === 'pending' ? 'fa-circle' : 'fa-check-circle';
        const checkColor = task.status === 'pending' ? 'var(--current-text-secondary)' : 'var(--success)';

        li.innerHTML = `
            <div class="priority-indicator"></div>
            <div class="task-header">
                <div class="task-title">${task.text}</div>
                <div class="task-actions">
                    <button class="action-btn" onclick="toggleTaskStatus('${task.id}')" title="Mark Status">
                        <i class="far ${checkIcon}" style="color: ${checkColor}"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteTask('${task.id}')" title="Delete Task">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                <span title="Date Added"><i class="far fa-clock"></i> ${formatDate(task.dateAdded)}</span>
                ${dueHtml}
            </div>
            ${subtasksHtml}
        `;

        if (task.status === 'pending') {
            pendingList.appendChild(li);
            pendingCount++;
        } else {
            completedList.appendChild(li);
            completedCount++;
        }
    });

    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
    updateProgress();
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent = percent + "%";
}

// === Drag and Drop ===
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    document.querySelectorAll('.dropzone').forEach(zone => zone.classList.remove('drag-over'));
}

const dropzones = document.querySelectorAll('.dropzone');

dropzones.forEach(zone => {
    zone.addEventListener('dragover', e => {
        e.preventDefault(); // Necessary to allow dropping
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        if (draggedItem) {
            const taskId = draggedItem.dataset.id;
            const newStatus = zone.dataset.status; // 'pending' or 'completed'

            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== newStatus) {
                task.status = newStatus;
                save();
                render();
            }
        }
    });
});


// === Event Listeners ===
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

searchInput.addEventListener("input", render);
filterInput.addEventListener("change", render);
sortInput.addEventListener("change", render);

document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("light");
    document.body.classList.toggle("dark");
    const icon = document.querySelector('#themeToggle i');
    if (document.body.classList.contains('light')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
};

// Init
render();