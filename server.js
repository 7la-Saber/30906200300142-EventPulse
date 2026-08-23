const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorMiddleware');
const Message = require('./models/Message');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1; 
  if (isDbConnected) {
    res.status(200).json({ status: 'success', message: 'Server is healthy and Database is connected' });
  } else {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

app.use(errorHandler);


if (!process.env.VERCEL) {
  const http = require('http');
  const { Server } = require('socket.io');
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;