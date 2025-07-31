require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api', routes);
// app.get('/api/urls/test', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Test route working!',
//     timestamp: new Date().toISOString()
//   });
// });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/api/urls/test`);
});