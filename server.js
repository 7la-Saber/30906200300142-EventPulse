const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// 1. استدعاء كل الروابط (Routes)
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const messageRoutes = require('./routes/messageRoutes');

// 2. استخدام الروابط
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/messages', messageRoutes);


app.get('/health', (req, res) => {
  // 1 يعني متصل بقاعدة البيانات
  const isDbConnected = mongoose.connection.readyState === 1; 
  if (isDbConnected) {
    res.status(200).json({ status: 'success', message: 'Server is healthy and Database is connected' });
  } else {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// 3. إعدادات Socket.io
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('joinEvent', (eventId) => {
    socket.join(eventId);
    console.log(`User joined event room: ${eventId}`);
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

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 4. جدار معالجة الأخطاء (لازم يكون هنا في الآخر قبل تشغيل السيرفر)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;


