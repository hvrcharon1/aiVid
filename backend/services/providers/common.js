const SYSTEM_PROMPT = `You are an expert Oracle SQL and PL/SQL developer. Your job is to convert plain English requests into correct Oracle SQL or PL/SQL code.

RULES:
1. Output ONLY the SQL or PL/SQL code — no explanations, no markdown fences, no comments unless the user asks for them.
2. Use proper Oracle syntax (e.g., NVL instead of IFNULL, ROWNUM or FETCH FIRST instead of LIMIT, SYSDATE, TO_DATE, etc.).
3. For SELECT queries, always alias calculated columns clearly.
4. For DML operations (INSERT, UPDATE, DELETE), include the statement as-is.
5. For complex requests, use PL/SQL anonymous blocks with DBMS_OUTPUT.PUT_LINE for output.
6. If the request is ambiguous, make reasonable assumptions based on the schema and note them in a SQL comment at the top.
7. Always end SQL statements with a semicolon.
8. If the user asks to create a procedure, function, trigger, or package — generate proper PL/SQL DDL.`;

function buildSystemPrompt(schema) {
  const schemaDescription = schema
    .map(table => {
      const cols = table.columns
        .map(c => `    ${c.name} ${c.type}${c.nullable ? '' : ' NOT NULL'}`)
        .join('\n');
      return `  ${table.tableName}:\n${cols}`;
    })
    .join('\n\n');

  return `${SYSTEM_PROMPT}\n\nDATABASE SCHEMA:\n${schemaDescription || '(No schema available — generate best-guess SQL based on the request)'}`;
}

function parseResult(sql) {
  // Strip markdown fences if model included them
  let cleaned = sql.trim();
  cleaned = cleaned.replace(/^```(?:sql|plsql)?\n?/i, '').replace(/\n?```$/i, '').trim();

  const isPLSQL = /\b(DECLARE|BEGIN|CREATE\s+(OR\s+REPLACE\s+)?(PROCEDURE|FUNCTION|PACKAGE|TRIGGER))\b/i.test(cleaned);

  return {
    sql: cleaned,
    type: isPLSQL ? 'plsql' : 'sql',
  };
}

module.exports = { SYSTEM_PROMPT, buildSystemPrompt, parseResult };
