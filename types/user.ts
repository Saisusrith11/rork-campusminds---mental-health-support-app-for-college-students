export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'student' | 'counselor' | 'volunteer' | 'admin';
  college?: string;
  avatar?: string;
  isOnboarded: boolean;
  createdAt: string;
  // Student specific fields
  studentId?: string;
  year?: string;
  department?: string;
  emergencyContact?: string;
  // Counselor specific fields
  licenseNumber?: string;
  specializations?: string[];
  experience?: string;
  qualifications?: string;
  // Volunteer specific fields
  volunteerType?: string;
  availability?: string;
  trainingCompleted?: boolean;
  // Assessment data
  lastAssessmentScore?: number;
  riskLevel?: 'minimal' | 'moderate' | 'high';
  consentToShare?: boolean;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  note?: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'counselor' | 'volunteer';
  timestamp: string;
  type: 'text' | 'image';
  isEncrypted?: boolean;
  sessionId?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'audio';
  duration?: string;
  category: string;
  imageUrl?: string;
  content?: string;
  assignedBy?: string; // counselor or admin id
  assignedTo?: string[]; // student ids
  language?: string;
  isPersonalized?: boolean;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isPrivate: boolean;
}

export interface Assessment {
  id: string;
  userId: string;
  score: number;
  responses: number[];
  riskLevel: 'minimal' | 'moderate' | 'high';
  timestamp: string;
  sharedWithCounselor?: boolean;
}

export interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'breathing' | 'exercise' | 'journaling' | 'mindfulness';
  duration: number;
  instructions: string[];
  assignedBy?: string;
  assignedTo?: string[];
  completedBy?: string[];
  category: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  counselorId: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  type: 'individual' | 'group' | 'crisis';
  notes?: string;
  studentRiskLevel?: 'minimal' | 'moderate' | 'high';
  studentAssessmentScore?: number;
}

export interface CommunityPost {
  id: string;
  content: string;
  authorId: string;
  isAnonymous: boolean;
  timestamp: string;
  responses: CommunityResponse[];
  category?: string;
}

export interface CommunityResponse {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorRole: 'volunteer' | 'counselor' | 'student';
  timestamp: string;
  isApproved: boolean;
}

export interface ChatSession {
  id: string;
  participants: string[];
  type: 'ai' | 'counselor' | 'volunteer';
  isActive: boolean;
  startTime: string;
  endTime?: string;
  isEncrypted: boolean;
}