# MindCare API Integration Guide

## Overview
This document provides complete API integration for your MindCare mental health platform. You now have both Node.js and PHP API implementations with a React Native service layer.

## API Setup

### Option 1: Node.js API
1. Navigate to `api/nodejs/` directory
2. Install dependencies:
   ```bash
   npm install express mysql2 bcryptjs jsonwebtoken cors helmet express-rate-limit multer uuid dotenv express-validator socket.io node-cron
   ```
3. Create `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=mindcare_db
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3000
   UPLOAD_PATH=./uploads
   ```
4. Run the server:
   ```bash
   node server.js
   ```

### Option 2: PHP API
1. Set up a web server (Apache/Nginx) with PHP 7.4+
2. Copy `api/php/` files to your web root
3. Update database credentials in `includes/config.php`
4. Ensure proper file permissions for uploads directory

### Database Setup
1. Import the SQL schema from `database/mindcare_schema.sql`
2. Update database credentials in your chosen API implementation
3. The schema includes demo users with these credentials:
   - Students: student1, student2, student3 (password: demo123)
   - Counselors: counselor1, counselor2, counselor3 (password: demo123)
   - Volunteers: volunteer1, volunteer2, volunteer3 (password: demo123)
   - Admins: admin1, admin2 (password: demo123)

## React Native Integration

### API Configuration
Update the API base URL in `services/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-api-domain.com/api', // Update this
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};
```

### Available Services
- `authService` - Authentication (login, register, logout)
- `moodService` - Mood tracking and analytics
- `chatService` - Chat sessions and messaging
- `appointmentService` - Appointment booking and management

### Usage Examples

#### Authentication
```typescript
import { useAuth } from '@/hooks/auth-store';

const { login, register, logout } = useAuth();

// Login
const result = await login({
  username: 'student1',
  password: 'demo123'
});

// Register
const result = await register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123',
  name: 'New User',
  role: 'student'
});
```

#### Mood Tracking
```typescript
import { moodService } from '@/services/mood';

// Create mood entry
const result = await moodService.createMoodEntry({
  mood: 'happy',
  note: 'Had a great day!'
});

// Get mood analytics
const analytics = await moodService.getMoodAnalytics();
```

#### Chat
```typescript
import { chatService } from '@/services/chat';

// Create chat session
const session = await chatService.createChatSession({
  type: 'counselor',
  participantId: 'counselor-001'
});

// Send message
const message = await chatService.sendMessage(session.data.id, {
  content: 'Hello, I need help with anxiety'
});
```

#### Appointments
```typescript
import { appointmentService } from '@/services/appointments';

// Book appointment
const appointment = await appointmentService.bookAppointment({
  counselorId: 'counselor-001',
  date: '2024-01-25',
  time: '14:00',
  type: 'individual',
  notes: 'Need help with stress management'
});
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Mood Tracking
- `GET /api/moods` - Get user's mood entries
- `POST /api/moods` - Create mood entry
- `GET /api/moods/analytics` - Get mood analytics

### Chat
- `GET /api/chat/sessions` - Get chat sessions
- `POST /api/chat/sessions` - Create chat session
- `GET /api/chat/sessions/:id/messages` - Get messages
- `POST /api/chat/sessions/:id/messages` - Send message

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/:id` - Update appointment

### Resources
- `GET /api/resources` - Get resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/:id/responses` - Add response

### Emergency Contacts
- `GET /api/emergency-contacts` - Get emergency contacts
- `POST /api/emergency-contacts` - Add contact (admin only)

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/files/:filename` - Get uploaded file

## Security Features
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- File upload restrictions

## Translation Support
The API supports multiple languages through the `language` parameter in resources and content. Supported languages:
- English (en)
- Telugu (te)
- Hindi (hi)
- Tamil (ta)

## Error Handling
All API responses follow this format:
```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string
}
```

## Next Steps
1. Set up your preferred API (Node.js or PHP)
2. Configure database connection
3. Update API base URL in React Native app
4. Test authentication with demo credentials
5. Implement real-time features with WebSocket (Node.js) or polling (PHP)
6. Add push notifications
7. Implement file upload for counselor/admin resources
8. Add AI chat integration with your preferred AI service

## Production Considerations
- Use HTTPS in production
- Set up proper database backups
- Implement logging and monitoring
- Use environment variables for sensitive data
- Set up rate limiting and DDoS protection
- Implement proper error tracking
- Use CDN for file uploads
- Set up database connection pooling