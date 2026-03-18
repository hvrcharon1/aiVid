const express = require('express');
const router = express.Router();
const mcpService = require('../services/mcpService');

// Get MCP server status
router.get('/status', (req, res) => {
  res.json(mcpService.getStatus());
});

// Connect to SQLcl MCP server
router.post('/connect', async (req, res) => {
  try {
    const config = req.body;
    const status = await mcpService.connect(config);
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect from MCP server
router.post('/disconnect', async (req, res) => {
  try {
    await mcpService.disconnect();
    res.json({ success: true, message: 'MCP server disconnected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List available MCP tools
router.get('/tools', async (req, res) => {
  try {
    const tools = await mcpService.listTools();
    res.json({ tools });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Call an MCP tool
router.post('/tools/call', async (req, res) => {
  try {
    const { toolName, args } = req.body;

    if (!toolName) {
      return res.status(400).json({ error: 'toolName is required' });
    }

    const result = await mcpService.callTool(toolName, args || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List MCP resources
router.get('/resources', async (req, res) => {
  try {
    const resources = await mcpService.listResources();
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
