# aiVid - AI Vision for Data

**Talk to your Oracle database in plain English.**

aiVid is a full-stack web application that lets you connect to any Oracle database, describe what you need in natural language, and automatically generates and executes the corresponding SQL or PL/SQL code. It supports multiple AI providers so you can use whichever model works best for you.

---

## Table of Contents

- [Features](#features)
- [Supported AI Providers](#supported-ai-providers)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
  - [Connecting to a Database](#connecting-to-a-database)
  - [Selecting an AI Provider](#selecting-an-ai-provider)
  - [Writing Queries in Plain English](#writing-queries-in-plain-english)
  - [Reviewing and Editing SQL](#reviewing-and-editing-sql)
  - [Executing Queries](#executing-queries)
  - [Using the Schema Browser](#using-the-schema-browser)
  - [Query History](#query-history)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Features

- **Natural Language to SQL** — Describe what you want in plain English and get accurate Oracle SQL or PL/SQL generated automatically.
- **Multi-Provider AI Support** — Choose from 5 AI providers and 17+ models including Claude, GPT, Gemini, Grok, and DeepSeek.
- **Connect to Any Oracle Database** — Works with any Oracle database instance. Uses Oracle's Thin mode by default, so no Oracle Client installation is required.
- **Schema-Aware Generation** — Automatically reads your database tables and columns so the AI generates accurate, context-aware SQL.
- **Live SQL Editor** — Review, edit, and refine the generated SQL before executing it.
- **PL/SQL Support** — Automatically detects and handles PL/SQL anonymous blocks, procedures, functions, triggers, and packages.
- **Results Table** — View query results in a clean, sortable table with column headers.
- **Schema Browser** — Explore your database tables and columns directly from the sidebar.
- **Query History** — Keeps a running history of your queries for quick reuse.
- **Per-Session API Keys** — Enter API keys directly in the UI without modifying server configuration.

---

## Supported AI Providers

| Provider | Models Available | API Key Source |
|---|---|---|
| **Anthropic (Claude)** | Claude Sonnet 4, Claude Haiku 4.5, Claude Opus 4.6 | [console.anthropic.com](https://console.anthropic.com/) |
| **OpenAI (GPT)** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, o3-mini | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Google (Gemini)** | Gemini 2.0 Flash, 2.0 Flash Lite, 1.5 Pro, 1.5 Flash | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **xAI (Grok)** | Grok 3, Grok 3 Mini, Grok 2 | [console.x.ai](https://console.x.ai/) |
| **DeepSeek (Coder)** | DeepSeek Coder, DeepSeek Chat (V3), DeepSeek Reasoner (R1) | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |

---

## Prerequisites

Before installing aiVid, make sure you have the following installed on your system:

1. **Node.js** (v18 or later)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **An Oracle Database** to connect to (local or remote)
   - Oracle 11g or later
   - You need the hostname, port, service name, and valid credentials

4. **At least one AI provider API key** (see [Supported AI Providers](#supported-ai-providers) above)

> **Note:** aiVid uses Oracle's `oracledb` package in **Thin mode** by default. This means you do **not** need to install Oracle Instant Client. If you do have Oracle Client installed, it will automatically use Thick mode for additional features.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/aiVid.git
cd aiVid
```

### 2. Install all dependencies

Run this single command from the project root to install dependencies for both backend and frontend:

```bash
npm run install:all
```

Or install them separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install --include=dev
```

### 3. Install root-level dependencies

```bash
# From project root
npm install --include=dev
```

---

## Configuration

### Setting up API Keys

Copy the example environment file and add your API keys:

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in a text editor and add the API keys for the providers you want to use:

```env
# Server
PORT=3001

# Add the API keys for the providers you want to use.
# You only need to set the keys for providers you plan to use.

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI (GPT)
OPENAI_API_KEY=sk-your-key-here

# Google (Gemini)
GEMINI_API_KEY=AIzaSy-your-key-here

# xAI (Grok)
XAI_API_KEY=xai-your-key-here

# DeepSeek
DEEPSEEK_API_KEY=sk-your-key-here
```

> **Tip:** You don't need to set all keys. Set only the ones for the providers you intend to use. You can also enter API keys directly in the application UI on a per-session basis.

### Server Port

The backend runs on port `3001` by default. Change the `PORT` value in `backend/.env` if needed. The frontend dev server runs on port `5173` and proxies API requests to the backend automatically.

---

## Running the Application

### Development Mode (Recommended)

From the project root, start both backend and frontend simultaneously:

```bash
npm run dev
```

This runs both servers concurrently:
- **Backend API** → `http://localhost:3001`
- **Frontend UI** → `http://localhost:5173`

Open your browser and navigate to **http://localhost:5173**.

### Start Servers Individually

If you prefer to run them in separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

To build the frontend for production:

```bash
npm run build
```

This creates an optimized build in `frontend/dist/`.

To start the backend in production:

```bash
cd backend
npm start
```

---

## Usage Guide

### Connecting to a Database

1. In the sidebar under **Connection**, fill in your Oracle database details:
   - **Host** — The hostname or IP address of your Oracle server (default: `localhost`)
   - **Port** — The listener port (default: `1521`)
   - **Service Name** — The Oracle service name (default: `ORCL`)
   - **Username** — Your Oracle database username
   - **Password** — Your Oracle database password

2. Click **Connect**.

3. On successful connection, the status indicator in the top bar turns green, and the Schema Browser populates with your database tables.

4. To disconnect, click the **Disconnect** button in the sidebar.

### Selecting an AI Provider

1. In the sidebar under **AI Provider**, select your preferred provider from the dropdown (e.g., Anthropic, OpenAI, Gemini, Grok, or DeepSeek).

2. Choose a specific model from the **Model** dropdown.

3. If you haven't set an API key in the server `.env` file, enter it in the **API Key** field. Keys entered here are stored in your browser's local storage and override any server-side key for that provider.

> Your provider and model selection is saved in your browser and persists across page refreshes.

### Writing Queries in Plain English

Type your request in the large text area in the main workspace. Here are some examples:

**Simple queries:**
- `Show all employees`
- `List the top 10 customers by total order amount`
- `Count how many orders were placed in 2024`

**Filtered queries:**
- `Show all employees who joined after January 2020 with salary above 50000`
- `Find customers from New York who haven't placed an order in the last 6 months`

**Aggregations:**
- `Show the average salary by department`
- `What is the total revenue per month for the last year?`

**DML operations:**
- `Insert a new employee named John Smith in the Engineering department with salary 75000`
- `Update all products with category 'Electronics' to have a 10% discount`
- `Delete all orders older than 5 years`

**PL/SQL:**
- `Create a procedure that calculates the bonus for each employee based on their performance rating`
- `Write a trigger that logs all changes to the employees table`
- `Create a function that returns the full name of an employee given their ID`

Press **Ctrl+Enter** or click **Convert to SQL** to generate the SQL.

### Reviewing and Editing SQL

After conversion, the generated SQL appears in the **Generated SQL** panel:

- The code is displayed in a syntax-highlighted editor.
- A badge indicates whether the output is `SQL` or `PL/SQL`.
- You can **edit the SQL** directly in the editor before executing.
- Click **Clear** to discard and start fresh.

### Executing Queries

1. Review the generated SQL in the preview panel.
2. Make any necessary edits.
3. Click **Execute** to run the query against your connected Oracle database.

Results appear in the **Results** panel below:
- **SELECT queries** — Results are shown in a formatted table with column headers, row count, and execution duration.
- **DML statements** (INSERT, UPDATE, DELETE) — Shows the number of rows affected and execution duration.
- **Errors** — Any Oracle errors are displayed with the error message and error code.

> **Important:** You must be connected to a database to execute queries. The Convert to SQL feature works even without a database connection, but execution requires an active connection.

### Using the Schema Browser

Once connected to a database, the **Schema Browser** in the sidebar displays all tables in your schema.

- Click on a table name to expand it and see its columns.
- Each column shows its name and data type.
- The schema information is also sent to the AI provider for more accurate SQL generation.

### Query History

The **History** section in the sidebar keeps a log of your recent queries:

- Each entry shows the English prompt and the time it was submitted.
- Click on any history entry to reload its generated SQL into the editor.
- History stores up to 50 entries per session.

---

## Project Structure

```
aiVid/
├── package.json                          # Root scripts (dev, install:all, build)
├── backend/
│   ├── package.json                      # Backend dependencies
│   ├── server.js                         # Express server entry point
│   ├── .env.example                      # Environment variable template
│   ├── routes/
│   │   ├── database.js                   # Database connection & schema endpoints
│   │   └── query.js                      # SQL conversion, execution & explain endpoints
│   └── services/
│       ├── nlpService.js                 # NLP-to-SQL service (delegates to providers)
│       ├── oracleService.js              # Oracle DB connection & query execution
│       └── providers/
│           ├── index.js                  # Provider registry
│           ├── common.js                 # Shared system prompt & SQL parsing
│           ├── anthropic.js              # Anthropic (Claude) provider
│           ├── openai.js                 # OpenAI (GPT) provider
│           ├── gemini.js                 # Google (Gemini) provider
│           ├── grok.js                   # xAI (Grok) provider
│           └── deepseek.js              # DeepSeek (Coder) provider
└── frontend/
    ├── package.json                      # Frontend dependencies
    ├── index.html                        # HTML entry point
    ├── vite.config.js                    # Vite config with API proxy
    └── src/
        ├── main.jsx                      # React app entry point
        ├── App.jsx                       # Main application component
        ├── index.css                     # Global styles
        ├── services/
        │   └── api.js                    # API client functions
        └── components/
            ├── ConnectionForm.jsx        # Oracle DB connection form
            ├── ProviderSettings.jsx      # AI provider & model selector
            ├── QueryInput.jsx            # Plain English input textarea
            ├── SqlPreview.jsx            # Generated SQL editor panel
            ├── ResultsTable.jsx          # Query results display table
            ├── SchemaViewer.jsx          # Database schema browser
            └── QueryHistory.jsx          # Query history sidebar
```

---

## API Reference

The backend exposes the following REST API endpoints:

### Health Check

```
GET /api/health
```

Returns server status and timestamp.

### Database Endpoints

```
POST /api/database/connect
```
Connect to an Oracle database.

**Request body:**
```json
{
  "sessionId": "unique-session-id",
  "user": "db_username",
  "password": "db_password",
  "host": "localhost",
  "port": "1521",
  "serviceName": "ORCL"
}
```

---

```
POST /api/database/disconnect
```
Disconnect from the current database.

**Request body:**
```json
{
  "sessionId": "unique-session-id"
}
```

---

```
GET /api/database/schema/:sessionId
```
Retrieve all tables and their columns for the connected user.

---

```
GET /api/database/table/:sessionId/:tableName
```
Get detailed information about a specific table (columns, constraints, indexes).

### Query Endpoints

```
GET /api/query/providers
```
List all available AI providers and their models.

---

```
POST /api/query/convert
```
Convert plain English to Oracle SQL/PL*SQL.

**Request body:**
```json
{
  "sessionId": "unique-session-id",
  "prompt": "Show all employees with salary above 50000",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "apiKey": "optional-override-key"
}
```

**Response:**
```json
{
  "sql": "SELECT * FROM employees WHERE salary > 50000;",
  "type": "sql",
  "model": "claude-sonnet-4-20250514",
  "usage": { "input_tokens": 150, "output_tokens": 25 }
}
```

---

```
POST /api/query/execute
```
Execute SQL against the connected Oracle database.

**Request body:**
```json
{
  "sessionId": "unique-session-id",
  "sql": "SELECT * FROM employees WHERE salary > 50000",
  "type": "sql"
}
```

**Response (SELECT):**
```json
{
  "success": true,
  "duration": "45ms",
  "columns": ["EMPLOYEE_ID", "FIRST_NAME", "LAST_NAME", "SALARY"],
  "rows": [
    { "EMPLOYEE_ID": 101, "FIRST_NAME": "John", "LAST_NAME": "Smith", "SALARY": 75000 }
  ],
  "rowCount": 1
}
```

---

```
POST /api/query/explain
```
Explain a SQL/PL*SQL statement in plain English.

**Request body:**
```json
{
  "sql": "SELECT department_id, AVG(salary) FROM employees GROUP BY department_id",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514"
}
```

---

## Troubleshooting

### Common Issues

**1. "invalid x-api-key" or 401 Authentication Error**

Your API key is invalid or not set. Check that:
- The key is correctly entered in `backend/.env` (no extra spaces or quotes).
- Or enter a valid key in the UI sidebar under "AI Provider".
- The key has not expired or been revoked.

**2. Cannot connect to Oracle database**

- Verify that the Oracle database is running and accessible from your machine.
- Check that the host, port, and service name are correct.
- Ensure the username and password are valid.
- If using a remote database, check firewall rules allow connections on the specified port.
- If you see TNS errors, verify the connect string format: `host:port/service_name`.

**3. "Not connected to any database" when executing queries**

You need to connect to a database before executing SQL. The "Convert to SQL" feature works without a database connection, but execution requires an active connection. Use the Connection section in the sidebar to connect first.

**4. Frontend shows blank page or API errors**

- Make sure the backend is running on port 3001 (check the terminal for `Oracle NLP Query API running on http://localhost:3001`).
- If running frontend and backend separately, ensure the Vite proxy is configured (it is by default in `vite.config.js`).

**5. `npm run dev` fails with "concurrently not found"**

Run `npm install --include=dev` from the project root directory.

**6. Oracle Thick mode errors**

If you have Oracle Client installed but encounter Thick mode errors, the application will fall back to Thin mode automatically. Thin mode supports most operations. If you need Thick mode features, ensure your Oracle Client is properly installed and `ORACLE_HOME` / `LD_LIBRARY_PATH` environment variables are set.

**7. Generated SQL is inaccurate**

- Connect to your database first so the schema is sent to the AI for context.
- Try a more specific prompt.
- Try a different AI model (larger models generally produce better SQL).
- Review and edit the generated SQL before executing.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Harshal V Rasal**

---

*aiVid — AI Vision for Data*
