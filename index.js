require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const redisConfig = require('./src/config/redis');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

redisConfig.connect()
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});