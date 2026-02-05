
/**
 * ZenTask Pro - Vanilla JS Logic
 */

// State Management
let todos = JSON.parse(localStorage.getItem('zentask-todos')) || [];
let currentFilter = 'all';
let searchQuery = '';
let selectedCategory = 'personal';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const searchInput = document.getElementById('searchInput');
const todoList = document.getElementById('todoList');
const categoryPills = document.querySelectorAll('.cat-pill');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressPercentage = document.getElementById('progressPercentage');
const totalTasksLabel = document.getElementById('totalTasks');
const pendingTasksLabel = document.getElementById('pendingTasks');
const finishedTasksLabel = document.getElementById('finishedTasks');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const footerControls = document.getElementById('footerControls');
const currentDateLabel = document.getElementById('currentDate');

// Initialize
function init() {
    render();
    updateDate();
    
    // Add task on enter
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    addTaskBtn.addEventListener('click', handleAddTask);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        render();
    });

    // Category selection
    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            selectedCategory = pill.dataset.cat;
            categoryPills.forEach(p => {
                p.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-700');
                p.classList.add('border-slate-100', 'bg-white', 'text-slate-500');
            });
            pill.classList.remove('border-slate-100', 'bg-white', 'text-slate-500');
            pill.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-700');
        });
    });

    // Filter selection
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => {
                b.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm');
                b.classList.add('text-slate-500');
            });
            btn.classList.remove('text-slate-500');
            btn.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
            render();
        });
    });

    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(t => !t.completed);
        save();
        render();
    });
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateLabel.textContent = new Date().toLocaleDateString(undefined, options);
}

function handleAddTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        category: selectedCategory,
        createdAt: Date.now()
    };

    todos.unshift(newTodo);
    taskInput.value = '';
    save();
    render();
}

function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save();
    render();
}

function deleteTodo(id) {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
        el.classList.add('removing');
        setTimeout(() => {
            todos = todos.filter(t => t.id !== id);
            save();
            render();
        }, 300);
    }
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('Edit task:', todo.text);
    if (newText !== null && newText.trim()) {
        todos = todos.map(t => t.id === id ? { ...t, text: newText.trim() } : t);
        save();
        render();
    }
}

function save() {
    localStorage.setItem('zentask-todos', JSON.stringify(todos));
}

function updateStats() {
    const total = todos.length;
    const finished = todos.filter(t => t.completed).length;
    const pending = total - finished;
    const percent = total === 0 ? 0 : Math.round((finished / total) * 100);

    progressPercentage.textContent = `${percent}%`;
    totalTasksLabel.textContent = total;
    pendingTasksLabel.textContent = pending;
    finishedTasksLabel.textContent = finished;

    footerControls.classList.toggle('hidden', finished === 0);
}

function render() {
    updateStats();
    todoList.innerHTML = '';

    const filtered = todos.filter(todo => {
        const matchesFilter = 
            currentFilter === 'all' ? true :
            currentFilter === 'active' ? !todo.completed :
            todo.completed;
        const matchesSearch = todo.text.toLowerCase().includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        renderEmptyState();
        return;
    }

    filtered.forEach(todo => {
        const item = createTodoElement(todo);
        todoList.appendChild(item);
    });
}

function renderEmptyState() {
    const isSearching = searchQuery !== '' || currentFilter !== 'all';
    todoList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <svg class="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800">${isSearching ? 'No matches found' : 'Start your journey'}</h3>
            <p class="text-slate-500 mt-2 max-w-xs mx-auto">
                ${isSearching ? 'Try adjusting your filters or search terms.' : 'Add your first task above to begin organizing your day.'}
            </p>
        </div>
    `;
}

function createTodoElement(todo) {
    const div = document.createElement('div');
    div.dataset.id = todo.id;
    div.className = `todo-item group flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 ${todo.completed ? 'bg-slate-50/50' : ''}`;
    
    const catColors = {
        personal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        work: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        urgent: 'bg-rose-100 text-rose-700 border-rose-200',
    };

    const time = new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
        <button class="toggle-btn w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-200 bg-white group-hover:border-indigo-300'}">
            ${todo.completed ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>' : ''}
        </button>

        <div class="flex-1 ml-4 overflow-hidden">
            <div class="flex flex-col">
                <span class="task-text text-base font-medium transition-all truncate ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}">
                    ${escapeHtml(todo.text)}
                </span>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${catColors[todo.category]}">
                        ${todo.category}
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">${time}</span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="edit-btn p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button class="delete-btn p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
        </div>
    `;

    // Events
    div.querySelector('.toggle-btn').onclick = () => toggleTodo(todo.id);
    div.querySelector('.delete-btn').onclick = () => deleteTodo(todo.id);
    div.querySelector('.edit-btn').onclick = () => editTodo(todo.id);

    return div;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Kick off
init();
