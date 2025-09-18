// Demo user credentials for testing all user roles
export interface DemoUser {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'counselor' | 'volunteer' | 'admin';
  name: string;
  email: string;
  college?: string;
  specialization?: string;
  languages?: string[];
  experience?: string;
  verified?: boolean;
}

export const demoUsers: DemoUser[] = [
  // Student Users
  {
    id: 'student_1',
    username: 'student1',
    password: 'demo123',
    role: 'student',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@college.edu',
    college: 'Delhi University',
  },
  {
    id: 'student_2',
    username: 'student2',
    password: 'demo123',
    role: 'student',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    college: 'Mumbai University',
  },
  {
    id: 'student_3',
    username: 'student3',
    password: 'demo123',
    role: 'student',
    name: 'Rahul Singh',
    email: 'rahul.singh@college.edu',
    college: 'Bangalore University',
  },

  // Counselor Users
  {
    id: 'counselor_1',
    username: 'counselor1',
    password: 'demo123',
    role: 'counselor',
    name: 'Dr. Meera Patel',
    email: 'meera.patel@campusminds.org',
    specialization: 'Clinical Psychology',
    languages: ['English', 'Hindi', 'Gujarati'],
    experience: '8 years',
    verified: true,
  },
  {
    id: 'counselor_2',
    username: 'counselor2',
    password: 'demo123',
    role: 'counselor',
    name: 'Dr. Rajesh Gupta',
    email: 'rajesh.gupta@campusminds.org',
    specialization: 'Anxiety & Depression',
    languages: ['English', 'Hindi', 'Tamil'],
    experience: '12 years',
    verified: true,
  },
  {
    id: 'counselor_3',
    username: 'counselor3',
    password: 'demo123',
    role: 'counselor',
    name: 'Dr. Anita Reddy',
    email: 'anita.reddy@campusminds.org',
    specialization: 'Student Counseling',
    languages: ['English', 'Telugu', 'Hindi'],
    experience: '6 years',
    verified: true,
  },

  // Volunteer Users
  {
    id: 'volunteer_1',
    username: 'volunteer1',
    password: 'demo123',
    role: 'volunteer',
    name: 'Kavya Nair',
    email: 'kavya.nair@volunteer.org',
    specialization: 'Peer Support',
    languages: ['English', 'Malayalam', 'Tamil'],
    experience: '2 years',
    verified: true,
  },
  {
    id: 'volunteer_2',
    username: 'volunteer2',
    password: 'demo123',
    role: 'volunteer',
    name: 'Amit Joshi',
    email: 'amit.joshi@volunteer.org',
    specialization: 'Crisis Support',
    languages: ['English', 'Hindi', 'Marathi'],
    experience: '3 years',
    verified: true,
  },
  {
    id: 'volunteer_3',
    username: 'volunteer3',
    password: 'demo123',
    role: 'volunteer',
    name: 'Sneha Das',
    email: 'sneha.das@volunteer.org',
    specialization: 'Academic Stress',
    languages: ['English', 'Bengali', 'Hindi'],
    experience: '1 year',
    verified: true,
  },

  // Admin Users
  {
    id: 'admin_1',
    username: 'admin1',
    password: 'demo123',
    role: 'admin',
    name: 'Dr. Vikram Agarwal',
    email: 'vikram.agarwal@campusminds.org',
    specialization: 'System Administration',
    experience: '15 years',
    verified: true,
  },
  {
    id: 'admin_2',
    username: 'admin2',
    password: 'demo123',
    role: 'admin',
    name: 'Sunita Mehta',
    email: 'sunita.mehta@campusminds.org',
    specialization: 'Platform Management',
    experience: '10 years',
    verified: true,
  },
];

// Demo notifications for different user roles
export const demoNotifications = {
  student: [
    {
      id: 'notif_student_1',
      title: 'Appointment Reminder',
      body: 'You have a counseling session with Dr. Meera Patel tomorrow at 2:00 PM',
      type: 'appointment',
      priority: 'high',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false,
    },
    {
      id: 'notif_student_2',
      title: 'New Message',
      body: 'Kavya Nair sent you a message in the community chat',
      type: 'message',
      priority: 'normal',
      timestamp: Date.now() - 7200000, // 2 hours ago
      read: false,
    },
    {
      id: 'notif_student_3',
      title: 'Mental Health Check-in',
      body: 'Take a moment to complete your daily wellness assessment',
      type: 'assessment',
      priority: 'normal',
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true,
    },
  ],
  counselor: [
    {
      id: 'notif_counselor_1',
      title: 'New Appointment Request',
      body: 'Arjun Kumar has requested a counseling session for tomorrow',
      type: 'appointment',
      priority: 'high',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      read: false,
    },
    {
      id: 'notif_counselor_2',
      title: 'High-Risk Assessment Alert',
      body: 'Student assessment shows high stress levels - immediate attention needed',
      type: 'emergency',
      priority: 'urgent',
      timestamp: Date.now() - 3600000, // 1 hour ago
      read: false,
    },
    {
      id: 'notif_counselor_3',
      title: 'Session Reminder',
      body: 'Upcoming session with Priya Sharma in 30 minutes',
      type: 'appointment',
      priority: 'high',
      timestamp: Date.now() - 900000, // 15 minutes ago
      read: true,
    },
  ],
  volunteer: [
    {
      id: 'notif_volunteer_1',
      title: 'Community Post Response',
      body: 'Your response to "Dealing with exam anxiety" received 5 likes',
      type: 'message',
      priority: 'low',
      timestamp: Date.now() - 5400000, // 1.5 hours ago
      read: false,
    },
    {
      id: 'notif_volunteer_2',
      title: 'New Chat Request',
      body: 'A student is requesting peer support chat',
      type: 'message',
      priority: 'normal',
      timestamp: Date.now() - 2700000, // 45 minutes ago
      read: false,
    },
    {
      id: 'notif_volunteer_3',
      title: 'Training Reminder',
      body: 'Monthly volunteer training session tomorrow at 6:00 PM',
      type: 'system',
      priority: 'normal',
      timestamp: Date.now() - 86400000, // 1 day ago
      read: true,
    },
  ],
  admin: [
    {
      id: 'notif_admin_1',
      title: 'System Alert',
      body: 'High server load detected - monitoring required',
      type: 'system',
      priority: 'high',
      timestamp: Date.now() - 1800000, // 30 minutes ago
      read: false,
    },
    {
      id: 'notif_admin_2',
      title: 'New Counselor Application',
      body: 'Dr. Sarah Johnson has applied to join as a counselor',
      type: 'system',
      priority: 'normal',
      timestamp: Date.now() - 7200000, // 2 hours ago
      read: false,
    },
    {
      id: 'notif_admin_3',
      title: 'Weekly Report Ready',
      body: 'Platform usage and mental health analytics report is available',
      type: 'system',
      priority: 'low',
      timestamp: Date.now() - 172800000, // 2 days ago
      read: true,
    },
  ],
};

// Demo offline data for different user roles
export const demoOfflineData = {
  student: {
    assessments: [
      {
        id: 'assessment_1',
        score: 18,
        date: Date.now() - 86400000,
        questions: 15,
        riskLevel: 'moderate',
      },
      {
        id: 'assessment_2',
        score: 12,
        date: Date.now() - 172800000,
        questions: 15,
        riskLevel: 'low',
      },
    ],
    resources: [
      {
        id: 'resource_1',
        title: 'Managing Exam Stress',
        content: 'Comprehensive guide to handling academic pressure...',
        category: 'stress',
        offline: true,
      },
      {
        id: 'resource_2',
        title: 'Sleep Hygiene for Students',
        content: 'Tips for better sleep during college years...',
        category: 'wellness',
        offline: true,
      },
    ],
    activities: [
      {
        id: 'activity_1',
        title: '5-Minute Breathing Exercise',
        description: 'Quick relaxation technique for stress relief',
        duration: 5,
        completed: true,
      },
      {
        id: 'activity_2',
        title: 'Gratitude Journaling',
        description: 'Daily practice for positive mindset',
        duration: 10,
        completed: false,
      },
    ],
  },
  counselor: {
    appointments: [
      {
        id: 'appointment_1',
        studentName: 'Arjun Kumar',
        date: Date.now() + 86400000,
        time: '14:00',
        type: 'individual',
        status: 'confirmed',
      },
      {
        id: 'appointment_2',
        studentName: 'Priya Sharma',
        date: Date.now() + 172800000,
        time: '10:30',
        type: 'follow-up',
        status: 'pending',
      },
    ],
    resources: [
      {
        id: 'counselor_resource_1',
        title: 'CBT Techniques for Anxiety',
        content: 'Professional guide to cognitive behavioral therapy...',
        category: 'professional',
        offline: true,
      },
    ],
  },
  volunteer: {
    messages: [
      {
        id: 'message_1',
        from: 'Anonymous Student',
        content: 'I\'m feeling overwhelmed with coursework...',
        timestamp: Date.now() - 3600000,
        responded: true,
      },
      {
        id: 'message_2',
        from: 'Anonymous Student',
        content: 'How do I deal with social anxiety?',
        timestamp: Date.now() - 7200000,
        responded: false,
      },
    ],
  },
  admin: {
    analytics: [
      {
        id: 'analytics_1',
        type: 'user_engagement',
        data: { activeUsers: 1250, newRegistrations: 45 },
        date: Date.now() - 86400000,
      },
      {
        id: 'analytics_2',
        type: 'mental_health_trends',
        data: { averageStressLevel: 6.2, emergencyAlerts: 3 },
        date: Date.now() - 86400000,
      },
    ],
  },
};

// Helper function to get demo user by credentials
export const getDemoUser = (username: string, password: string): DemoUser | null => {
  return demoUsers.find(user => 
    user.username === username && user.password === password
  ) || null;
};

// Helper function to get demo notifications for user role
export const getDemoNotifications = (role: string) => {
  return demoNotifications[role as keyof typeof demoNotifications] || [];
};

// Helper function to get demo offline data for user role
export const getDemoOfflineData = (role: string) => {
  return demoOfflineData[role as keyof typeof demoOfflineData] || {};
};