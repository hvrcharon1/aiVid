require('dotenv').config();
const express = require('express');
const cors = require('cors');
const databaseRoutes = require('./routes/database');
const queryRoutes = require('./routes/query');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/database', databaseRoutes);
app.use('/api/query', queryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Oracle NLP Query API running on http://localhost:${PORT}`);
});
