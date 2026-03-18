const express = require('express');
const router = express.Router();
const oracleService = require('../services/oracleService');
const nlpService = require('../services/nlpService');
const { listProviders } = require('../services/providers');

// List available AI providers and their models
router.get('/providers', (req, res) => {
  res.json({ providers: listProviders() });
});

// Convert English to SQL
router.post('/convert', async (req, res) => {
  try {
    const { sessionId, prompt, provider, model, apiKey, extraFields } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    // Get schema if connected (for better SQL generation)
    let schema = [];
    try {
      if (sessionId) {
        schema = await oracleService.getSchema(sessionId);
      }
    } catch {
      // Schema fetch failed — still convert without schema context
    }

    const result = await nlpService.convertToSQL(prompt, schema, {
      provider,
      model,
      apiKey,
      ...extraFields,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Execute SQL
router.post('/execute', async (req, res) => {
  try {
    const { sessionId, sql, type } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    if (!sql) {
      return res.status(400).json({ error: 'sql is required' });
    }

    const startTime = Date.now();
    let result;

    // Clean the SQL - remove trailing semicolons for regular SQL (oracledb doesn't want them)
    let cleanSQL = sql.trim();

    if (type === 'plsql') {
      // PL/SQL blocks need the trailing semicolons and slash
      result = await oracleService.executePLSQL(sessionId, cleanSQL);
    } else {
      // Regular SQL - remove trailing semicolon
      cleanSQL = cleanSQL.replace(/;\s*$/, '');
      result = await oracleService.executeSQL(sessionId, cleanSQL);
    }

    const duration = Date.now() - startTime;

    const response = {
      success: true,
      duration: `${duration}ms`,
      rowsAffected: result.rowsAffected || 0,
    };

    if (result.rows) {
      response.columns = result.metaData
        ? result.metaData.map(m => m.name)
        : Object.keys(result.rows[0] || {});
      response.rows = result.rows;
      response.rowCount = result.rows.length;
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      errorCode: err.errorNum,
      offset: err.offset,
    });
  }
});

// Explain SQL in plain English
router.post('/explain', async (req, res) => {
  try {
    const { sql, provider, model, apiKey, extraFields } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'sql is required' });
    }

    const explanation = await nlpService.explainSQL(sql, {
      provider,
      model,
      apiKey,
      ...extraFields,
    });
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
