const API = 'http://localhost:3000/api/tasks';
let currentFilter = 'all';

// ---- Render ----
function statusLabel(status) {
    return { todo: 'A Fazer', 'in-progress': 'Em Andamento', done: 'Concluída' }[status] || status;
}

function renderTasks(tasks) {
    const list = document.getElementById('tasks');
    list.innerHTML = '';

    if (tasks.length === 0) {
        list.innerHTML = '<li class="empty">Nenhuma tarefa encontrada.</li>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task task--${task.status}`;
        li.innerHTML = `
            <div class="task-info">
                <strong class="task-title">${task.title}</strong>
                ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
            </div>
            <div class="task-actions">
                <select class="status-select" onchange="changeStatus(${task.id}, this.value)">
                    <option value="todo"        ${task.status === 'todo'        ? 'selected' : ''}>A Fazer</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>Em Andamento</option>
                    <option value="done"        ${task.status === 'done'        ? 'selected' : ''}>Concluída</option>
                </select>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Excluir</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// ---- Load ----
async function loadTasks(status = currentFilter) {
    try {
        const url = status === 'all' ? API : `${API}?status=${status}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao buscar tarefas');
        renderTasks(await res.json());
    } catch {
        document.getElementById('tasks').innerHTML =
            '<li class="empty error">Não foi possível conectar ao servidor. Certifique-se de que ele está rodando.</li>';
    }
}

// ---- Add ----
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title       = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    if (!title) return;

    await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title, description }),
    });

    e.target.reset();
    loadTasks();
});

// ---- Change Status ----
async function changeStatus(id, status) {
    await fetch(`${API}/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
    });
    loadTasks();
}

// ---- Delete ----
async function deleteTask(id) {
    if (!confirm('Excluir esta tarefa?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadTasks();
}

// ---- Filters ----
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.status;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTasks();
    });
});

// ---- Init ----
loadTasks();
