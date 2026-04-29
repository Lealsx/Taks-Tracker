# Task Tracker

Aplicação web para gerenciar suas tarefas do dia a dia. Criada com HTML, CSS e Node.js puro — sem frameworks.

## Funcionalidades

- Adicionar tarefas com título e descrição
- Alterar o status de cada tarefa (A Fazer / Em Andamento / Concluída)
- Filtrar tarefas por status
- Excluir tarefas
- Dados persistidos em arquivo `tasks.json`

## Tecnologias

- **Frontend:** HTML, CSS, JavaScript (Fetch API)
- **Backend:** Node.js (http, fs — sem dependências externas)

## Como rodar

**1. Inicie o servidor:**
```bash
npm start
```
O servidor sobe em `http://localhost:3000`.

**2. Abra o frontend:**

Abra o arquivo `index.html` no browser (via Live Server ou diretamente).

## Estrutura

```
Task Tracker/
├── index.html
├── package.json
└── src/
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js        # servidor Node.js (API REST)
        └── frontend.js   # JavaScript do browser
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/tasks` | Lista todas as tarefas |
| GET | `/api/tasks?status=todo` | Filtra por status |
| POST | `/api/tasks` | Cria nova tarefa |
| PATCH | `/api/tasks/:id` | Atualiza status |
| PUT | `/api/tasks/:id` | Atualiza título/descrição |
| DELETE | `/api/tasks/:id` | Remove tarefa |

## Autor

**Luis Leal** — [github.com/Lealsx](https://github.com/Lealsx)
