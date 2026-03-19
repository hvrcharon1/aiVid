# aiVid - AI Vision for Data

**Talk to your Oracle database in plain English.**

aiVid is a full-stack web application that lets you connect to any Oracle database, describe what you need in natural language, and automatically generates and executes the corresponding SQL or PL/SQL code. It supports multiple AI providers and integrates with Oracle SQLcl MCP Server for advanced database operations.

---

## Table of Contents

- [Features](#features)
- [Supported AI Providers](#supported-ai-providers)
- [Oracle SQLcl MCP Integration](#oracle-sqlcl-mcp-integration)
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
  - [Using Oracle SQLcl MCP Tools](#using-oracle-sqlcl-mcp-tools)
  - [Custom Tools](#custom-tools)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Features

- **Natural Language to SQL** — Describe what you want in plain English and get accurate Oracle SQL or PL/SQL generated automatically.
- **Multi-Provider AI Support** — Choose from 8 AI providers and 40+ models including Claude, GPT, Gemini, Grok, DeepSeek, Microsoft Copilot, Ollama (local), and Groq.
- **Oracle SQLcl MCP Server** — Full integration with Oracle's Model Context Protocol server for advanced database operations including ER diagram generation, DDL extraction, SQLcl scripting, metadata browsing, and more.
- **Connect to Any Oracle Database** — Works with any Oracle database instance. Uses Oracle's Thin mode by default, so no Oracle Client installation is required.
- **Schema-Aware Generation** — Automatically reads your database tables and columns so the AI generates accurate, context-aware SQL.
- **Live SQL Editor** — Review, edit, and refine the generated SQL before executing it.
- **PL/SQL Support** — Automatically detects and handles PL/SQL anonymous blocks, procedures, functions, triggers, and packages.
- **Results Table** — View query results in a clean, sortable table with column headers.
- **Schema Browser** — Explore your database tables and columns directly from the sidebar.
- **Query History** — Keeps a running history of your queries for quick reuse.
- **Per-Session API Keys** — Enter API keys directly in the UI without modifying server configuration.
- **Provider Connection Test** — Verify your AI provider and model are reachable with a single click. A green dot indicator appears next to the model name on successful connection, and a red dot with an error message if it fails. The status resets automatically when you change provider, model, or credentials.
- **Custom Tools** — Define reusable, parameterized SQL templates as custom tools. Each custom tool wraps a SQL template with named `{{placeholder}}` parameters, is persisted to disk, and executes via the MCP `execute_sql` tool. Manage custom tools through a dedicated UI tab with full create, edit, and delete support.

---

## Supported AI Providers

| Provider | Models Available | API Key Source |
|---|---|---|
| **Anthropic (Claude)** | Claude Sonnet 4, Claude Haiku 4.5, Claude Opus 4.6 | [console.anthropic.com](https://console.anthropic.com/) |
| **OpenAI (GPT)** | GPT-4o, GPT-4o Mini, GPT-4 Turbo, o3-mini | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Google (Gemini)** | Gemini 2.0 Flash, 2.0 Flash Lite, 1.5 Pro, 1.5 Flash | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **xAI (Grok)** | Grok 3, Grok 3 Mini, Grok 2 | [console.x.ai](https://console.x.ai/) |
| **DeepSeek (Coder)** | DeepSeek Coder, DeepSeek Chat (V3), DeepSeek Reasoner (R1) | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |
| **Microsoft Copilot (Azure)** | GPT-4o (Azure), GPT-4o Mini (Azure), GPT-4, GPT-3.5 Turbo | [portal.azure.com](https://portal.azure.com/) |
| **Ollama (Local)** | Qwen 3 Coder (30B), GPT-OSS (20B), DeepSeek R1 (8B/Full), Llama 3.1 (8B/70B), Code Llama, DeepSeek Coder V2, Qwen 2.5 Coder, Mistral, Mixtral, Phi-3, Gemma 2 | [ollama.com](https://ollama.com/) |
| **Groq** | Llama 3.3 70B, Llama 3.1 8B, DeepSeek R1 Distill 70B, Qwen QwQ 32B, Gemma 2 9B, Mixtral 8x7B, Compound Beta | [console.groq.com](https://console.groq.com/) |

### Microsoft Copilot Setup

Microsoft Copilot in aiVid uses Azure OpenAI Service. To use it:

1. Create an Azure OpenAI resource in the [Azure Portal](https://portal.azure.com/).
2. Deploy a model (e.g., gpt-4o) in your Azure OpenAI Studio.
3. In aiVid, select **Microsoft Copilot (Azure)** as the provider.
4. Enter your **Azure Endpoint** (e.g., `https://your-resource.openai.azure.com`) and **API Key**.
5. Select the model matching your Azure deployment name.

You can set these in `backend/.env` or enter them directly in the UI:

```env
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-10-21
```

### Ollama Setup

Ollama runs AI models locally on your machine — no API key or cloud account required. To use it:

1. Install Ollama from [ollama.com](https://ollama.com/).
2. Pull a model (e.g., `ollama pull llama3.1` or `ollama pull codellama`).
3. Start the Ollama server: `ollama serve` (it runs on `http://localhost:11434` by default).
4. In aiVid, select **Ollama (Local)** as the provider.
5. Select the model you pulled from the model dropdown.
6. Leave the **API Key** field empty (Ollama doesn't need one).

If Ollama is running on a different host or port, enter the URL in the **Ollama Host URL** field in the UI, or set it in `backend/.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
```

> **Tip:** For SQL generation tasks, `codellama`, `deepseek-coder-v2`, and `qwen2.5-coder:7b` tend to produce the best results. The model dropdown lists popular models, but you can use any model you've pulled — select it from the list if it matches, or enter its name.

### Groq Setup

Groq provides ultra-fast inference for open-source models via their cloud API. To use it:

1. Create a free account at [console.groq.com](https://console.groq.com/).
2. Generate an API key from the Groq console.
3. In aiVid, select **Groq** as the provider.
4. Choose a model (e.g., Llama 3.3 70B, DeepSeek R1 Distill 70B, or Qwen QwQ 32B).
5. Enter your Groq API key in the **API Key** field.

You can also set the key in `backend/.env`:

```env
GROQ_API_KEY=gsk_your-groq-key-here
```

> **Tip:** Groq is known for extremely fast inference speeds. Models like `llama-3.3-70b-versatile` and `deepseek-r1-distill-llama-70b` offer strong SQL generation performance with sub-second response times.

---

## Oracle SQLcl MCP Integration

aiVid integrates with the **Oracle SQLcl MCP Server** — Oracle's official Model Context Protocol server built into SQLcl 24.3+. This integration gives you access to powerful database tools directly from the aiVid interface, making Oracle stand out as a modern platform for IT professionals.

### What is Oracle SQLcl MCP?

The MCP (Model Context Protocol) server in Oracle SQLcl exposes database operations as standardized tools that AI applications can discover and invoke. Unlike simple SQL execution, MCP tools provide rich, structured access to the full Oracle ecosystem.

### Available MCP Tool Categories

| Category | Capabilities |
|---|---|
| **Query** | Execute SQL queries with formatted results |
| **PL/SQL** | Run PL/SQL blocks, anonymous blocks, and scripts |
| **Schema** | List tables, describe objects, browse database structure |
| **DDL** | Extract DDL for any database object (tables, views, procedures, packages) |
| **Diagram** | Generate ER diagrams in Mermaid format |
| **SQLcl** | Execute SQLcl-specific commands (CTAS, DATAPUMP, LIQUIBASE, etc.) |
| **Data** | Export and import data operations |
| **Info** | Database metadata, object counts, system information |

### Why Use MCP Over Direct SQL?

- **Richer tooling** — Access SQLcl features like ER diagram generation, Liquibase changelog generation, and Data Pump operations that aren't available through plain SQL.
- **Structured output** — Tools return well-formatted, structured results rather than raw query output.
- **Discoverability** — Browse all available tools and their parameters through the UI.
- **Oracle ecosystem integration** — Leverage the full power of SQLcl including APEX integration, REST services, and more.
- **AI-ready** — MCP is the emerging standard protocol for connecting AI applications to tools and data sources.

### SQLcl MCP Prerequisites

- **Oracle SQLcl 24.3 or later** with MCP support enabled.
- Download from [oracle.com/tools/downloads/sqlcl](https://www.oracle.com/database/sqldeveloper/technologies/sqlcl/download/).
- Ensure the `sql` command is available in your system PATH, or configure the path in the `.env` file or UI.

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
   - Not required for **Ollama**, which runs models locally with no API key

5. **Oracle SQLcl 24.3+** *(optional, for MCP features)*
   - Required only if you want to use the Oracle SQLcl MCP integration
   - Download from [oracle.com](https://www.oracle.com/database/sqldeveloper/technologies/sqlcl/download/)

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

# Microsoft Copilot (Azure OpenAI)
AZURE_OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-10-21

# Ollama (Local) - no API key needed
OLLAMA_BASE_URL=http://localhost:11434

# Groq
GROQ_API_KEY=your-groq-key

# Oracle SQLcl MCP Server (optional)
# Path to SQLcl binary. Leave empty to auto-detect from PATH.
SQLCL_PATH=
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

The application has two main workspace tabs: **NLP Query** for natural language SQL generation and **Oracle SQLcl MCP** for advanced database operations.

### Connecting to a Database

1. In the sidebar under **Oracle Connection**, fill in your Oracle database details:
   - **Host** — The hostname or IP address of your Oracle server (default: `localhost`)
   - **Port** — The listener port (default: `1521`)
   - **Service Name** — The Oracle service name (default: `ORCL`)
   - **Username** — Your Oracle database username
   - **Password** — Your Oracle database password

2. Click **Connect**.

3. On successful connection, the status indicator in the top bar turns green, and the Schema Browser populates with your database tables.

4. To disconnect, click the **Disconnect** button in the sidebar.

### Selecting an AI Provider

1. In the sidebar under **AI Provider**, select your preferred provider from the dropdown (e.g., Anthropic, OpenAI, Gemini, Grok, DeepSeek, Microsoft Copilot, Ollama, or Groq).

2. Choose a specific model from the **Model** dropdown.

3. Some providers show additional fields:
   - **Microsoft Copilot (Azure)** — Enter your **Azure Endpoint** URL.
   - **Ollama (Local)** — Enter the **Ollama Host URL** if it's not running on the default `http://localhost:11434`.

4. If you haven't set an API key in the server `.env` file, enter it in the **API Key** field. Keys entered here are stored in your browser's local storage and override any server-side key for that provider. For **Ollama**, no API key is needed — leave the field empty.

5. Click **Test Connection** to verify that the provider and model are reachable. On success, a **green dot** appears next to the model label confirming the connection is live. If the test fails, a **red dot** and error message appear so you can diagnose the issue (e.g., invalid API key, unreachable server, model not found). The status automatically resets when you change any setting.

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

### Using Oracle SQLcl MCP Tools

Switch to the **Oracle SQLcl MCP** tab in the main workspace to access advanced Oracle database tools.

#### Starting the MCP Server

1. Click the **Oracle SQLcl MCP** tab.
2. Under the **Connection** tab, enter your SQLcl and database details:
   - **SQLcl Path** — Path to the `sql` binary (leave empty to auto-detect from PATH)
   - **Host**, **Port**, **Service Name** — Same as your Oracle connection
   - **Username** and **Password** — Oracle credentials
3. Click **Start MCP Server**. This spawns an Oracle SQLcl process in MCP mode.
4. Once connected, the **Tools** tab populates with all available MCP tools.

#### Browsing and Running Tools

1. Switch to the **Tools** tab to see all available MCP tools grouped by category.
2. Click on any tool to see its description and input parameters.
3. Fill in the required parameters in the form.
4. Click **Run Tool** to execute.
5. Switch to the **Output** tab to view the results.

#### Example MCP Workflows

**Generate an ER Diagram:**
1. Select the `generate_er_diagram` tool.
2. Optionally specify which tables to include.
3. Run the tool to get a Mermaid-format ER diagram.

**Extract DDL:**
1. Select the `get_ddl` tool.
2. Enter the object type (e.g., `TABLE`) and object name.
3. Get the complete CREATE statement for any database object.

**Run SQLcl Commands:**
1. Select the `execute_sqlcl_command` tool.
2. Enter any SQLcl command (e.g., `CTAS`, `DDL`, `INFO`, `LIQUIBASE`).
3. Get structured output from the command.

### Custom Tools

Custom tools let you save reusable, parameterized SQL operations that execute through the MCP server. Each custom tool wraps a SQL template with named `{{placeholder}}` parameters, so you can run common queries without retyping them.

#### Creating a Custom Tool

1. Open the **Oracle SQLcl MCP** tab and click the **Custom** tab.
2. Fill in the form:
   - **Tool Name** — A short identifier (e.g., `check-user-count`).
   - **Description** — What the tool does.
   - **Parameters** — Click **+ Add** to define named parameters. Each parameter has a name, type (`string` or `number`), and an optional required flag.
   - **SQL Template** — The SQL to execute. Use `{{paramName}}` placeholders for parameters (e.g., `SELECT COUNT(*) FROM users WHERE role = '{{role}}'`).
3. Click **Save Tool**. The tool is persisted to `backend/data/custom-tools.json` and survives server restarts.

#### Editing and Deleting Custom Tools

- Saved tools appear in a list below the form on the **Custom** tab.
- Click **Edit** to load a tool back into the form for modification, then click **Update Tool** to save.
- Click **Delete** to remove a tool. An inline confirmation prompt (Yes/No) appears to prevent accidental deletion.

#### Running a Custom Tool

1. Switch to the **Tools** tab. Custom tools appear under a **Custom** category alongside built-in MCP tools. Each tool displays a badge (**Built-in** or **Custom**) for easy identification.
2. Select a custom tool. The detail pane shows its description, SQL template, and auto-generated input fields for each parameter.
3. Fill in the parameter values and click **Run Tool**.
4. The backend substitutes the parameter values into the SQL template and executes the rendered SQL via the MCP server's SQL execution tool.
5. Results appear in the **Output** tab, the same as built-in tool results.

> **Note:** Custom tools require an active MCP server connection to execute, since they run SQL through the MCP `execute_sql` tool. You can create and manage custom tools at any time, but execution is only available when connected.

---

## Project Structure

```
aiVid/
├── package.json                          # Root scripts (dev, install:all, build)
├── LICENSE                               # MIT License
├── README.md                             # This documentation
├── backend/
│   ├── package.json                      # Backend dependencies
│   ├── server.js                         # Express server entry point
│   ├── .env.example                      # Environment variable template
│   ├── data/
│   │   └── custom-tools.json            # Persisted custom tools (auto-created)
│   ├── routes/
│   │   ├── database.js                   # Database connection & schema endpoints
│   │   ├── query.js                      # SQL conversion, execution & explain endpoints
│   │   ├── mcp.js                        # Oracle SQLcl MCP server endpoints
│   │   └── customTools.js               # Custom tools CRUD & execute endpoints
│   └── services/
│       ├── nlpService.js                 # NLP-to-SQL service (delegates to providers)
│       ├── oracleService.js              # Oracle DB connection & query execution
│       ├── mcpService.js                 # Oracle SQLcl MCP client management
│       ├── customToolsService.js         # Custom tools CRUD, persistence & execution
│       └── providers/
│           ├── index.js                  # Provider registry
│           ├── common.js                 # Shared system prompt & SQL parsing
│           ├── anthropic.js              # Anthropic (Claude) provider
│           ├── openai.js                 # OpenAI (GPT) provider
│           ├── gemini.js                 # Google (Gemini) provider
│           ├── grok.js                   # xAI (Grok) provider
│           ├── deepseek.js              # DeepSeek (Coder) provider
│           ├── copilot.js               # Microsoft Copilot (Azure OpenAI) provider
│           ├── ollama.js                # Ollama (Local) provider
│           └── groq.js                  # Groq provider
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
            ├── QueryHistory.jsx          # Query history sidebar
            └── McpPanel.jsx             # Oracle SQLcl MCP tools panel
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
List all available AI providers, their models, and any extra configuration fields.

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
  "apiKey": "optional-override-key",
  "extraFields": {
    "azureEndpoint": "https://my-resource.openai.azure.com"
  }
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

---

```
POST /api/query/explain
```
Explain a SQL/PL*SQL statement in plain English.

---

```
POST /api/query/test-provider
```
Test connectivity to an AI provider and model. Sends a minimal request to verify the provider is reachable and the API key is valid.

**Request body:**
```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "apiKey": "optional-override-key",
  "extraFields": {}
}
```

**Response (success):**
```json
{
  "success": true
}
```

**Response (failure):**
```json
{
  "success": false,
  "error": "Groq API key is required"
}
```

### MCP Endpoints

```
GET /api/mcp/status
```
Get the current MCP server connection status.

---

```
POST /api/mcp/connect
```
Start and connect to an Oracle SQLcl MCP server.

**Request body:**
```json
{
  "user": "db_username",
  "password": "db_password",
  "host": "localhost",
  "port": "1521",
  "serviceName": "ORCL",
  "sqlclPath": "/path/to/sql"
}
```

---

```
POST /api/mcp/disconnect
```
Stop the MCP server and disconnect.

---

```
GET /api/mcp/tools
```
List all available MCP tools with their descriptions, categories, and input schemas.

**Response:**
```json
{
  "tools": [
    {
      "name": "execute_sql",
      "description": "Execute a SQL statement",
      "category": "Query",
      "inputSchema": {
        "type": "object",
        "properties": {
          "sql": { "type": "string", "description": "SQL statement to execute" }
        },
        "required": ["sql"]
      }
    }
  ]
}
```

---

```
POST /api/mcp/tools/call
```
Invoke an MCP tool with arguments.

**Request body:**
```json
{
  "toolName": "get_ddl",
  "args": {
    "object_type": "TABLE",
    "object_name": "EMPLOYEES"
  }
}
```

**Response:**
```json
{
  "success": true,
  "output": ["CREATE TABLE EMPLOYEES (\n  EMPLOYEE_ID NUMBER(6) NOT NULL,\n  ..."]
}
```

---

```
GET /api/mcp/resources
```
List MCP resources exposed by the SQLcl server.

### Custom Tools Endpoints

```
GET /api/tools/custom
```
List all saved custom tools.

**Response:**
```json
{
  "tools": [
    {
      "id": "uuid",
      "name": "check-user-count",
      "description": "Count users matching a role",
      "parameters": [
        { "name": "role", "type": "string", "required": true }
      ],
      "sqlTemplate": "SELECT COUNT(*) FROM users WHERE role = '{{role}}'",
      "createdAt": "2026-03-18T10:00:00.000Z",
      "updatedAt": "2026-03-18T10:00:00.000Z"
    }
  ]
}
```

---

```
POST /api/tools/custom
```
Create a new custom tool.

**Request body:**
```json
{
  "name": "check-user-count",
  "description": "Count users matching a role",
  "parameters": [
    { "name": "role", "type": "string", "required": true }
  ],
  "sqlTemplate": "SELECT COUNT(*) FROM users WHERE role = '{{role}}'"
}
```

---

```
PUT /api/tools/custom/:id
```
Update an existing custom tool. Accepts the same fields as create.

---

```
DELETE /api/tools/custom/:id
```
Delete a custom tool by ID.

---

```
POST /api/tools/custom/:id/execute
```
Execute a custom tool. Renders the SQL template with the provided arguments and runs it via the MCP server's SQL execution tool. Requires an active MCP connection.

**Request body:**
```json
{
  "args": {
    "role": "admin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sql": "SELECT COUNT(*) FROM users WHERE role = 'admin'",
  "output": ["COUNT(*)\n----------\n42"]
}
```

---

## Troubleshooting Tips

### AI Provider Issues

**"API key is required" error**
Your API key is not set. Either enter it in the **API Key** field in the sidebar, or set the corresponding environment variable in `backend/.env`. Use the **Test Connection** button to verify before querying.

**Test Connection shows red dot**
- **Invalid API key** — Double-check the key has no extra spaces or quotes. Ensure it hasn't expired or been revoked.
- **Network error / connection refused** — For cloud providers, check your internet connection. For Ollama, ensure `ollama serve` is running. For Groq, verify the API endpoint is reachable.
- **Model not found** — The selected model may not be available. For Ollama, pull the model first (`ollama pull <model>`). For Groq, check their console for currently supported models.

**Ollama connection refused**
- Ensure Ollama is running: `ollama serve` (or check that the system service is active).
- Default URL is `http://localhost:11434`. If running on a different host/port, update the **Ollama Host URL** field or set `OLLAMA_BASE_URL` in `.env`.
- Verify the model is pulled: `ollama list` to see installed models.

**Azure OpenAI / Microsoft Copilot errors**
- Ensure you have deployed a model in your Azure OpenAI resource.
- The model name in aiVid must match your Azure deployment name.
- Check your endpoint URL format: `https://your-resource.openai.azure.com`.

### Database Issues

**Cannot connect to Oracle database**
- Verify the database is running and accessible.
- Check host, port, and service name are correct.
- Ensure credentials are valid.
- Check firewall rules for the specified port.

**"Not connected to any database" when executing queries**
Connect to a database first using the sidebar. SQL generation works without a connection, but execution requires one.

### MCP & Custom Tools Issues

**MCP server fails to start**
- Ensure Oracle SQLcl 24.3+ is installed and `sql` is in your PATH.
- Verify with `sql -version` in your terminal.
- If installed in a non-standard location, set `SQLCL_PATH` in `backend/.env` or enter the path in the MCP Connection tab.
- SQLcl requires Java (JDK 11+).

**Custom tool execution: "null connection not allowed"**
The MCP server process is running but has no active database connection (e.g., started with `/nolog`). Stop and restart the MCP server with valid database credentials.

**Custom tool: "Could not find a SQL execution tool"**
The MCP server does not expose a recognized SQL execution tool. Verify your SQLcl version (24.3+) supports MCP by checking the available tools in the Tools tab.

**Custom tool: "Missing required parameters"**
Required parameters were not filled in. Select the custom tool in the **Tools** tab and provide values for all fields marked with a red asterisk (*).

### General Issues

**Frontend shows blank page or API errors**
- Ensure the backend is running on port 3001.
- If running separately, the Vite proxy in `vite.config.js` handles API forwarding automatically.

**`npm run dev` fails with "concurrently not found"**
Run `npm install --include=dev` from the project root directory.

**Generated SQL is inaccurate**
- Connect to your database first so the schema context is sent to the AI.
- Try a more specific prompt or a different/larger model.
- Review and edit the generated SQL before executing.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

**Harshal V Rasal**

---

*aiVid — AI Vision for Data*
