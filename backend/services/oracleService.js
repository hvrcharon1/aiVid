const oracledb = require('oracledb');

// Store active connections by session ID
const connections = new Map();

// Try thin mode first (no Oracle Client needed), fall back to thick
try {
  oracledb.initOracleClient();
  console.log('OracleDB: Using Thick mode (Oracle Client found)');
} catch {
  console.log('OracleDB: Using Thin mode (no Oracle Client needed)');
}

async function connect(sessionId, config) {
  // Close existing connection for this session if any
  await disconnect(sessionId);

  const connection = await oracledb.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString, // e.g. "host:port/service_name"
  });

  connections.set(sessionId, connection);
  return { connected: true };
}

async function disconnect(sessionId) {
  const conn = connections.get(sessionId);
  if (conn) {
    try {
      await conn.close();
    } catch (e) {
      // ignore close errors
    }
    connections.delete(sessionId);
  }
}

function getConnection(sessionId) {
  const conn = connections.get(sessionId);
  if (!conn) {
    throw new Error('Not connected to any database. Please connect first.');
  }
  return conn;
}

async function executeSQL(sessionId, sql, binds = [], options = {}) {
  const conn = getConnection(sessionId);

  const execOptions = {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    autoCommit: true,
    ...options,
  };

  const result = await conn.execute(sql, binds, execOptions);
  return result;
}

async function executePLSQL(sessionId, plsql, binds = {}) {
  const conn = getConnection(sessionId);

  const result = await conn.execute(plsql, binds, {
    autoCommit: true,
  });

  return result;
}

async function getSchema(sessionId) {
  const conn = getConnection(sessionId);

  // Get all tables owned by current user
  const tables = await conn.execute(
    `SELECT table_name FROM user_tables ORDER BY table_name`,
    [],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const schema = [];
  for (const table of tables.rows) {
    const columns = await conn.execute(
      `SELECT column_name, data_type, data_length, nullable
       FROM user_tab_columns
       WHERE table_name = :tname
       ORDER BY column_id`,
      [table.TABLE_NAME],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    schema.push({
      tableName: table.TABLE_NAME,
      columns: columns.rows.map(c => ({
        name: c.COLUMN_NAME,
        type: c.DATA_TYPE,
        length: c.DATA_LENGTH,
        nullable: c.NULLABLE === 'Y',
      })),
    });
  }

  return schema;
}

async function getTableDetails(sessionId, tableName) {
  const conn = getConnection(sessionId);

  const [columns, constraints, indexes] = await Promise.all([
    conn.execute(
      `SELECT column_name, data_type, data_length, data_precision, data_scale, nullable, data_default
       FROM user_tab_columns WHERE table_name = :tname ORDER BY column_id`,
      [tableName.toUpperCase()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
    conn.execute(
      `SELECT c.constraint_name, c.constraint_type, cc.column_name, c.r_constraint_name
       FROM user_constraints c
       JOIN user_cons_columns cc ON c.constraint_name = cc.constraint_name
       WHERE c.table_name = :tname
       ORDER BY c.constraint_name, cc.position`,
      [tableName.toUpperCase()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
    conn.execute(
      `SELECT index_name, uniqueness FROM user_indexes WHERE table_name = :tname`,
      [tableName.toUpperCase()],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    ),
  ]);

  return {
    tableName: tableName.toUpperCase(),
    columns: columns.rows,
    constraints: constraints.rows,
    indexes: indexes.rows,
  };
}

module.exports = {
  connect,
  disconnect,
  getConnection,
  executeSQL,
  executePLSQL,
  getSchema,
  getTableDetails,
};
