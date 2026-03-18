const express = require('express');
const router = express.Router();
const oracleService = require('../services/oracleService');

// Connect to Oracle database
router.post('/connect', async (req, res) => {
  try {
    const { sessionId, user, password, host, port, serviceName, connectString } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const connStr = connectString || `${host || 'localhost'}:${port || 1521}/${serviceName || 'ORCL'}`;

    await oracleService.connect(sessionId, {
      user,
      password,
      connectString: connStr,
    });

    res.json({ success: true, message: `Connected to ${connStr} as ${user}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect
router.post('/disconnect', async (req, res) => {
  try {
    const { sessionId } = req.body;
    await oracleService.disconnect(sessionId);
    res.json({ success: true, message: 'Disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get schema (all tables and columns)
router.get('/schema/:sessionId', async (req, res) => {
  try {
    const schema = await oracleService.getSchema(req.params.sessionId);
    res.json({ schema });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table details
router.get('/table/:sessionId/:tableName', async (req, res) => {
  try {
    const details = await oracleService.getTableDetails(
      req.params.sessionId,
      req.params.tableName
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
