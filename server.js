const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorMiddleware');
const Message = require('./models/Message');


const swaggerUiDist = require('swagger-ui-dist');
const pathToSwaggerUi = swaggerUiDist.absolutePath();

dotenv.config();
connectDB();

const app = express();
app.use(express.json());


app.use('/api-docs/swagger-ui', express.static(pathToSwaggerUi)); 
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCssUrl: '/api-docs/swagger-ui/swagger-ui.css',
    customJs: [
      '/api-docs/swagger-ui/swagger-ui-bundle.js',
      '/api-docs/swagger-ui/swagger-ui-standalone-preset.js'
    ]
  })
);

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

    socket.on('joinEvent', (eventId) => {
      socket.join(eventId);
    });

    socket.on('sendAnnouncement', async (data) => {
      try {
        const { eventId, senderId, text } = data;
        const message = await Message.create({ event: eventId, sender: senderId, text });
        io.to(eventId).emit('receiveAnnouncement', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;