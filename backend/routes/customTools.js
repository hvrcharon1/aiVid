const express = require('express');
const router = express.Router();
const customToolsService = require('../services/customToolsService');
const mcpService = require('../services/mcpService');

// GET /api/tools/custom - list all custom tools
router.get('/custom', (req, res) => {
  try {
    res.json({ tools: customToolsService.list() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tools/custom - create a custom tool
router.post('/custom', (req, res) => {
  try {
    const { name, description, parameters, sqlTemplate } = req.body;
    if (!name || !sqlTemplate) {
      return res.status(400).json({ error: 'name and sqlTemplate are required' });
    }
    const tool = customToolsService.create({ name, description, parameters, sqlTemplate });
    res.json({ tool });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tools/custom/:id - update a custom tool
router.put('/custom/:id', (req, res) => {
  try {
    const tool = customToolsService.update(req.params.id, req.body);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });
    res.json({ tool });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tools/custom/:id - delete a custom tool
router.delete('/custom/:id', (req, res) => {
  try {
    const removed = customToolsService.remove(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Tool not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tools/custom/:id/execute - execute a custom tool
router.post('/custom/:id/execute', async (req, res) => {
  try {
    const status = mcpService.getStatus();
    if (!status.connected) {
      return res.status(400).json({ error: 'MCP server is not connected' });
    }
    const result = await customToolsService.execute(req.params.id, req.body.args || {}, mcpService);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
