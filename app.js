const express = require('express');
const faceitRoutes = require('./src/routes/faceitRoutes');
require('dotenv').config();

const app = express();

// Routes
app.use('/api/faceit', faceitRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
