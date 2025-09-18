const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mindcare_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'audio/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// AUTHENTICATION ROUTES
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name, role, ...additionalData } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    const insertQuery = `
      INSERT INTO users (id, username, email, password_hash, name, role, college, 
        student_id, year, department, emergency_contact, license_number, 
        specializations, experience, qualifications, volunteer_type, availability, 
        training_completed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(insertQuery, [
      userId, username, email, passwordHash, name, role,
      additionalData.college || null,
      additionalData.studentId || null,
      additionalData.year || null,
      additionalData.department || null,
      additionalData.emergencyContact || null,
      additionalData.licenseNumber || null,
      additionalData.specializations ? JSON.stringify(additionalData.specializations) : null,
      additionalData.experience || null,
      additionalData.qualifications || null,
      additionalData.volunteerType || null,
      additionalData.availability || null,
      additionalData.trainingCompleted || false
    ]);

    // Generate token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        name,
        role,
        isOnboarded: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Store session
    await pool.execute(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
      [user.id, token]
    );

    // Return user data (excluding password)
    const { password_hash, ...userData } = user;
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        ...userData,
        specializations: userData.specializations ? JSON.parse(userData.specializations) : null,
        languages: userData.languages ? JSON.parse(userData.languages) : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await pool.execute('DELETE FROM user_sessions WHERE token = ?', [token]);
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password_hash, ...userData } = req.user;
  res.json({
    user: {
      ...userData,
      specializations: userData.specializations ? JSON.parse(userData.specializations) : null,
      languages: userData.languages ? JSON.parse(userData.languages) : null
    }
  });
});

// MOOD TRACKING ROUTES
app.get('/api/moods', authenticateToken, async (req, res) => {
  try {
    const [moods] = await pool.execute(
      'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY timestamp DESC',
      [req.user.id]
    );
    res.json(moods);
  } catch (error) {
    console.error('Get moods error:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

app.post('/api/moods', authenticateToken, async (req, res) => {
  try {
    const { mood, note } = req.body;
    const moodId = uuidv4();

    await pool.execute(
      'INSERT INTO mood_entries (id, user_id, mood, note) VALUES (?, ?, ?, ?)',
      [moodId, req.user.id, mood, note]
    );

    const [newMood] = await pool.execute(
      'SELECT * FROM mood_entries WHERE id = ?',
      [moodId]
    );

    res.status(201).json(newMood[0]);
  } catch (error) {
    console.error('Create mood error:', error);
    res.status(500).json({ error: 'Failed to create mood entry' });
  }
});

app.get('/api/moods/analytics', authenticateToken, async (req, res) => {
  try {
    const [weeklyMoods] = await pool.execute(`
      SELECT mood, COUNT(*) as count, DATE(timestamp) as date
      FROM mood_entries 
      WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY mood, DATE(timestamp)
      ORDER BY timestamp DESC
    `, [req.user.id]);

    const [moodTrend] = await pool.execute(`
      SELECT 
        CASE mood
          WHEN 'very-sad' THEN 1
          WHEN 'sad' THEN 2
          WHEN 'neutral' THEN 3
          WHEN 'happy' THEN 4
          WHEN 'very-happy' THEN 5
        END as mood_score,
        DATE(timestamp) as date
      FROM mood_entries 
      WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY timestamp DESC
    `, [req.user.id]);

    res.json({
      weeklyMoods,
      moodTrend,
      averageScore: moodTrend.length > 0 
        ? moodTrend.reduce((sum, entry) => sum + entry.mood_score, 0) / moodTrend.length 
        : 0
    });
  } catch (error) {
    console.error('Mood analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch mood analytics' });
  }
});

// CHAT ROUTES
app.get('/api/chat/sessions', authenticateToken, async (req, res) => {
  try {
    const [sessions] = await pool.execute(`
      SELECT cs.*, 
        GROUP_CONCAT(u.name) as participant_names
      FROM chat_sessions cs
      LEFT JOIN users u ON JSON_CONTAINS(cs.participants, JSON_QUOTE(u.id))
      WHERE JSON_CONTAINS(cs.participants, JSON_QUOTE(?))
      GROUP BY cs.id
      ORDER BY cs.start_time DESC
    `, [req.user.id]);

    res.json(sessions.map(session => ({
      ...session,
      participants: JSON.parse(session.participants)
    })));
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

app.post('/api/chat/sessions', authenticateToken, async (req, res) => {
  try {
    const { type, participantId } = req.body;
    const sessionId = uuidv4();
    const participants = [req.user.id];
    
    if (participantId) {
      participants.push(participantId);
    }

    await pool.execute(
      'INSERT INTO chat_sessions (id, participants, type) VALUES (?, ?, ?)',
      [sessionId, JSON.stringify(participants), type]
    );

    const [newSession] = await pool.execute(
      'SELECT * FROM chat_sessions WHERE id = ?',
      [sessionId]
    );

    res.status(201).json({
      ...newSession[0],
      participants: JSON.parse(newSession[0].participants)
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

app.get('/api/chat/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify user is participant
    const [sessions] = await pool.execute(
      'SELECT participants FROM chat_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participants = JSON.parse(sessions[0].participants);
    if (!participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [messages] = await pool.execute(`
      SELECT cm.*, u.name as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.session_id = ?
      ORDER BY cm.timestamp ASC
    `, [sessionId]);

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat/sessions/:sessionId/messages', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const messageId = uuidv4();

    // Verify user is participant
    const [sessions] = await pool.execute(
      'SELECT participants FROM chat_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participants = JSON.parse(sessions[0].participants);
    if (!participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute(`
      INSERT INTO chat_messages (id, session_id, sender_id, content, sender_type, message_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [messageId, sessionId, req.user.id, content, req.user.role, messageType]);

    const [newMessage] = await pool.execute(`
      SELECT cm.*, u.name as sender_name
      FROM chat_messages cm
      LEFT JOIN users u ON cm.sender_id = u.id
      WHERE cm.id = ?
    `, [messageId]);

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// APPOINTMENTS ROUTES
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT a.*, 
        s.name as student_name, s.email as student_email,
        c.name as counselor_name, c.email as counselor_email
      FROM appointments a
      LEFT JOIN users s ON a.student_id = s.id
      LEFT JOIN users c ON a.counselor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND a.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'counselor') {
      query += ' AND a.counselor_id = ?';
      params.push(req.user.id);
    }
    // Admin can see all appointments

    query += ' ORDER BY a.date DESC, a.time DESC';

    const [appointments] = await pool.execute(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticateToken, authorize(['student']), async (req, res) => {
  try {
    const { counselorId, date, time, type = 'individual', notes } = req.body;
    const appointmentId = uuidv4();

    // Get student's latest assessment for risk level
    const [assessments] = await pool.execute(
      'SELECT score, risk_level FROM assessments WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [req.user.id]
    );

    const studentAssessmentScore = assessments.length > 0 ? assessments[0].score : null;
    const studentRiskLevel = assessments.length > 0 ? assessments[0].risk_level : 'minimal';

    await pool.execute(`
      INSERT INTO appointments (id, student_id, counselor_id, date, time, type, notes, 
        student_assessment_score, student_risk_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [appointmentId, req.user.id, counselorId, date, time, type, notes, 
        studentAssessmentScore, studentRiskLevel]);

    // Create notification for counselor
    const notificationId = uuidv4();
    await pool.execute(`
      INSERT INTO notifications (id, user_id, title, body, type, priority, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [notificationId, counselorId, 'New Appointment Request', 
        `${req.user.name} has requested an appointment`, 'appointment', 'normal',
        JSON.stringify({ appointmentId })]);

    const [newAppointment] = await pool.execute(`
      SELECT a.*, 
        s.name as student_name, s.email as student_email,
        c.name as counselor_name, c.email as counselor_email
      FROM appointments a
      LEFT JOIN users s ON a.student_id = s.id
      LEFT JOIN users c ON a.counselor_id = c.id
      WHERE a.id = ?
    `, [appointmentId]);

    res.status(201).json(newAppointment[0]);
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if user can update this appointment
    const [appointments] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = appointments[0];
    
    if (req.user.role === 'counselor' && appointment.counselor_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'student' && appointment.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.execute(
      'UPDATE appointments SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [status, notes, id]
    );

    // Create notification for student
    let notificationTitle = '';
    let notificationBody = '';
    
    switch (status) {
      case 'approved':
        notificationTitle = 'Appointment Approved';
        notificationBody = 'Your appointment has been approved';
        break;
      case 'declined':
        notificationTitle = 'Appointment Declined';
        notificationBody = `Your appointment has been declined. ${notes || ''}`;
        break;
      case 'completed':
        notificationTitle = 'Session Completed';
        notificationBody = 'Your counseling session has been completed';
        break;
    }

    if (notificationTitle) {
      const notificationId = uuidv4();
      await pool.execute(`
        INSERT INTO notifications (id, user_id, title, body, type, priority, data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [notificationId, appointment.student_id, notificationTitle, notificationBody,
          'appointment', status === 'approved' ? 'high' : 'normal',
          JSON.stringify({ appointmentId: id })]);
    }

    const [updatedAppointment] = await pool.execute(`
      SELECT a.*, 
        s.name as student_name, s.email as student_email,
        c.name as counselor_name, c.email as counselor_email
      FROM appointments a
      LEFT JOIN users s ON a.student_id = s.id
      LEFT JOIN users c ON a.counselor_id = c.id
      WHERE a.id = ?
    `, [id]);

    res.json(updatedAppointment[0]);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// RESOURCES ROUTES
app.get('/api/resources', authenticateToken, async (req, res) => {
  try {
    const { category, type, language = 'en' } = req.query;
    
    let query = `
      SELECT r.*, u.name as assigned_by_name
      FROM resources r
      LEFT JOIN users u ON r.assigned_by = u.id
      WHERE r.is_active = 1 AND (r.language = ? OR r.language IS NULL)
    `;
    const params = [language];

    if (category) {
      query += ' AND r.category = ?';
      params.push(category);
    }

    if (type) {
      query += ' AND r.type = ?';
      params.push(type);
    }

    // Check for personalized resources
    if (req.user.role === 'student') {
      query += ` AND (r.is_personalized = 0 OR 
        EXISTS (SELECT 1 FROM resource_assignments ra WHERE ra.resource_id = r.id AND ra.assigned_to = ?))`;
      params.push(req.user.id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [resources] = await pool.execute(query, params);
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

app.post('/api/resources', authenticateToken, authorize(['counselor', 'admin']), async (req, res) => {
  try {
    const { title, description, type, duration, category, content, fileUrl, language = 'en', isPersonalized = false } = req.body;
    const resourceId = uuidv4();

    await pool.execute(`
      INSERT INTO resources (id, title, description, type, duration, category, content, 
        file_url, assigned_by, language, is_personalized)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [resourceId, title, description, type, duration, category, content, 
        fileUrl, req.user.id, language, isPersonalized]);

    const [newResource] = await pool.execute(
      'SELECT * FROM resources WHERE id = ?',
      [resourceId]
    );

    res.status(201).json(newResource[0]);
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// COMMUNITY ROUTES
app.get('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT cp.*, 
        CASE WHEN cp.is_anonymous = 1 THEN 'Anonymous' ELSE u.name END as author_name,
        u.role as author_role,
        COUNT(cr.id) as response_count
      FROM community_posts cp
      LEFT JOIN users u ON cp.author_id = u.id
      LEFT JOIN community_responses cr ON cp.id = cr.post_id AND cr.is_approved = 1
      WHERE cp.is_approved = 1
      GROUP BY cp.id
      ORDER BY cp.timestamp DESC
    `);

    res.json(posts);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
});

app.post('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const { content, isAnonymous = false, category } = req.body;
    const postId = uuidv4();

    await pool.execute(
      'INSERT INTO community_posts (id, content, author_id, is_anonymous, category) VALUES (?, ?, ?, ?, ?)',
      [postId, content, req.user.id, isAnonymous, category]
    );

    const [newPost] = await pool.execute(`
      SELECT cp.*, 
        CASE WHEN cp.is_anonymous = 1 THEN 'Anonymous' ELSE u.name END as author_name,
        u.role as author_role
      FROM community_posts cp
      LEFT JOIN users u ON cp.author_id = u.id
      WHERE cp.id = ?
    `, [postId]);

    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.get('/api/community/posts/:postId/responses', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const [responses] = await pool.execute(`
      SELECT cr.*, u.name as author_name
      FROM community_responses cr
      LEFT JOIN users u ON cr.author_id = u.id
      WHERE cr.post_id = ? AND cr.is_approved = 1
      ORDER BY cr.timestamp ASC
    `, [postId]);

    res.json(responses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

app.post('/api/community/posts/:postId/responses', authenticateToken, authorize(['volunteer', 'counselor']), async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const responseId = uuidv4();

    await pool.execute(
      'INSERT INTO community_responses (id, post_id, content, author_id, author_role) VALUES (?, ?, ?, ?, ?)',
      [responseId, postId, content, req.user.id, req.user.role]
    );

    const [newResponse] = await pool.execute(`
      SELECT cr.*, u.name as author_name
      FROM community_responses cr
      LEFT JOIN users u ON cr.author_id = u.id
      WHERE cr.id = ?
    `, [responseId]);

    res.status(201).json(newResponse[0]);
  } catch (error) {
    console.error('Create response error:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
});

// EMERGENCY CONTACTS ROUTES
app.get('/api/emergency-contacts', authenticateToken, async (req, res) => {
  try {
    const [contacts] = await pool.execute(
      'SELECT * FROM emergency_contacts WHERE is_active = 1 ORDER BY is_national DESC, name ASC'
    );
    res.json(contacts);
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch emergency contacts' });
  }
});

app.post('/api/emergency-contacts', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, phone, description, type } = req.body;
    const contactId = uuidv4();

    await pool.execute(
      'INSERT INTO emergency_contacts (id, name, phone, description, type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [contactId, name, phone, description, type, req.user.id]
    );

    const [newContact] = await pool.execute(
      'SELECT * FROM emergency_contacts WHERE id = ?',
      [contactId]
    );

    res.status(201).json(newContact[0]);
  } catch (error) {
    console.error('Create emergency contact error:', error);
    res.status(500).json({ error: 'Failed to create emergency contact' });
  }
});

// FILE UPLOAD ROUTES
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const { uploadType = 'document' } = req.body;

    await pool.execute(`
      INSERT INTO file_uploads (id, original_name, file_name, file_path, file_type, 
        file_size, uploaded_by, upload_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [fileId, req.file.originalname, req.file.filename, req.file.path,
        req.file.mimetype, req.file.size, req.user.id, uploadType]);

    res.json({
      id: fileId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      url: `/api/files/${req.file.filename}`
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

app.get('/api/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.env.UPLOAD_PATH || './uploads', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// NOTIFICATIONS ROUTES
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications.map(notif => ({
      ...notif,
      data: notif.data ? JSON.parse(notif.data) : null
    })));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ASSESSMENTS ROUTES
app.get('/api/assessments', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM assessments WHERE user_id = ? ORDER BY timestamp DESC';
    const params = [req.user.id];

    if (req.user.role === 'counselor') {
      query = `SELECT a.*, u.name as user_name FROM assessments a 
               LEFT JOIN users u ON a.user_id = u.id 
               WHERE a.shared_with_counselor = 1 ORDER BY a.timestamp DESC`;
      params.length = 0;
    }

    const [assessments] = await pool.execute(query, params);
    res.json(assessments.map(assessment => ({
      ...assessment,
      responses: JSON.parse(assessment.responses)
    })));
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

app.post('/api/assessments', authenticateToken, authorize(['student']), async (req, res) => {
  try {
    const { score, responses, riskLevel, sharedWithCounselor = false } = req.body;
    const assessmentId = uuidv4();

    await pool.execute(`
      INSERT INTO assessments (id, user_id, score, responses, risk_level, shared_with_counselor)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [assessmentId, req.user.id, score, JSON.stringify(responses), riskLevel, sharedWithCounselor]);

    // Update user's risk level
    await pool.execute(
      'UPDATE users SET last_assessment_score = ?, risk_level = ? WHERE id = ?',
      [score, riskLevel, req.user.id]
    );

    const [newAssessment] = await pool.execute(
      'SELECT * FROM assessments WHERE id = ?',
      [assessmentId]
    );

    res.status(201).json({
      ...newAssessment[0],
      responses: JSON.parse(newAssessment[0].responses)
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MindCare API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;