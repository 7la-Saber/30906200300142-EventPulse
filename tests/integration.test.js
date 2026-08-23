const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

// 1. زيادة وقت الاختبار لـ 30 ثانية عشان نتجنب الـ Timeout
jest.setTimeout(30000);

let token;
let uniqueEmail;

beforeAll(async () => {
  uniqueEmail = `admin_${Date.now()}@test.com`;

  // 2. إنشاء المستخدم مباشرة في الداتا بيز
  await User.create({
    name: 'Admin Test',
    email: uniqueEmail,
    password: 'password123',
    role: 'admin'
  });

  // 3. تسجيل الدخول للحصول على التوكن
  const loginRes = await request(app).post('/api/auth/login').send({
    email: uniqueEmail,
    password: 'password123'
  });
  
  token = loginRes.body.token;
});

afterAll(async () => {
  // تنظيف الداتا بيز بعد الانتهاء
  await User.deleteOne({ email: uniqueEmail });
  await mongoose.connection.close();
});

describe('Integration Tests: Events API', () => {
  
  it('should create a new event successfully when logged in as admin', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Supertest Event',
        description: 'Testing the API',
        date: '2026-10-10',
        city: 'Cairo',
        capacity: 100,
        category: new mongoose.Types.ObjectId()
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Supertest Event');
  });

  it('should return a list of events', async () => {
    const res = await request(app).get('/api/events');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter events by city', async () => {
    const res = await request(app).get('/api/events?city=Cairo');
    expect(res.statusCode).toBe(200);
  });
});