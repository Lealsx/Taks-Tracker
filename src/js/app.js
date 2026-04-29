const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const TASKS_FILE = path.join(__dirname, '..', 'tasks.json');

// Função para ler as tarefas do arquivo JSON
function readTasks() {
    try {
        if (!fs.existsSync(TASKS_FILE)) {
            fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        return [];
    }
}

// Função para escrever tarefas no arquivo JSON
function writeTasks(tasks) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao escrever arquivo:', error);
        return false;
    }
}

// Função para gerar novo ID
function generateId(tasks) {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.id)) + 1;
}

// Função para obter timestamp atual
function getTimestamp() {
    return new Date().toISOString();
}

// Manipulador de requisições
const server = http.createServer((req, res) => {
    // Configurar CORS para permitir requisições do frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Responder requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Rota para listar tarefas
    if (pathname === '/api/tasks' && req.method === 'GET') {
        const tasks = readTasks();
        const status = parsedUrl.query.status;
        
        let filteredTasks = tasks;
        if (status && status !== 'all') {
            filteredTasks = tasks.filter(task => task.status === status);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filteredTasks));
    }
    
    // Rota para adicionar tarefa
    else if (pathname === '/api/tasks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { title, description } = JSON.parse(body);
                
                if (!title || title.trim() === '') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Título é obrigatório' }));
                    return;
                }
                
                const tasks = readTasks();
                const newTask = {
                    id: generateId(tasks),
                    title: title.trim(),
                    description: description ? description.trim() : '',
                    status: 'todo',
                    createdAt: getTimestamp(),
                    updatedAt: getTimestamp()
                };
                
                tasks.push(newTask);
                
                if (writeTasks(tasks)) {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newTask));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao salvar tarefa' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Dados inválidos' }));
            }
        });
    }
    
    // Rota para atualizar tarefa
    else if (pathname.startsWith('/api/tasks/') && req.method === 'PUT') {
        const id = parseInt(pathname.split('/')[3]);
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const updates = JSON.parse(body);
                const tasks = readTasks();
                const taskIndex = tasks.findIndex(t => t.id === id);
                
                if (taskIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
                    return;
                }
                
                // Atualizar apenas os campos permitidos
                if (updates.title) tasks[taskIndex].title = updates.title.trim();
                if (updates.description) tasks[taskIndex].description = updates.description.trim();
                if (updates.status) tasks[taskIndex].status = updates.status;
                
                tasks[taskIndex].updatedAt = getTimestamp();
                
                if (writeTasks(tasks)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tasks[taskIndex]));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao atualizar tarefa' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Dados inválidos' }));
            }
        });
    }
    
    // Rota para deletar tarefa
    else if (pathname.startsWith('/api/tasks/') && req.method === 'DELETE') {
        const id = parseInt(pathname.split('/')[3]);
        const tasks = readTasks();
        const filteredTasks = tasks.filter(t => t.id !== id);
        
        if (filteredTasks.length === tasks.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
            return;
        }
        
        if (writeTasks(filteredTasks)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Tarefa deletada com sucesso' }));
        } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro ao deletar tarefa' }));
        }
    }
    
    // Rota para atualizar status
    else if (pathname.startsWith('/api/tasks/') && req.method === 'PATCH') {
        const id = parseInt(pathname.split('/')[3]);
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { status } = JSON.parse(body);
                
                if (!['todo', 'in-progress', 'done'].includes(status)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Status inválido' }));
                    return;
                }
                
                const tasks = readTasks();
                const taskIndex = tasks.findIndex(t => t.id === id);
                
                if (taskIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Tarefa não encontrada' }));
                    return;
                }
                
                tasks[taskIndex].status = status;
                tasks[taskIndex].updatedAt = getTimestamp();
                
                if (writeTasks(tasks)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tasks[taskIndex]));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Erro ao atualizar status' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Dados inválidos' }));
            }
        });
    }
    
    // Rota não encontrada
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada' }));
    }
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`API disponível em http://localhost:${PORT}/api/tasks`);
});