import type { Resource, SupportGroup, WellnessActivity, Assessment } from '@/types/user';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  type: 'crisis' | 'support';
  isNational?: boolean;
}

export const resources: Resource[] = [
  {
    id: '1',
    title: '5-Minute Breathing Exercise',
    description: 'Calm your mind with guided breathing',
    type: 'exercise',
    duration: '5 min',
    category: 'Mindfulness',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    content: 'A simple breathing exercise to help you relax and center yourself.',
  },
  {
    id: '2',
    title: 'Understanding Anxiety',
    description: 'Learn about anxiety and coping strategies',
    type: 'article',
    duration: '10 min read',
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    content: 'Comprehensive guide to understanding and managing anxiety.',
  },
  {
    id: '3',
    title: 'Sleep Better Tonight',
    description: 'Guided meditation for better sleep',
    type: 'audio',
    duration: '15 min',
    category: 'Sleep',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop',
    content: 'Relaxing meditation to help you fall asleep peacefully.',
  },
  {
    id: '4',
    title: 'Stress Management Techniques',
    description: 'Practical ways to manage daily stress',
    type: 'video',
    duration: '8 min',
    category: 'Stress Relief',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    content: 'Video guide on effective stress management techniques.',
  },
  {
    id: '5',
    title: 'Building Self-Confidence',
    description: 'Boost your self-esteem and confidence',
    type: 'article',
    duration: '7 min read',
    category: 'Personal Growth',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    content: 'Tips and strategies for building lasting self-confidence.',
  },
];

export const supportGroups: SupportGroup[] = [
  {
    id: '1',
    name: 'Anxiety Support',
    description: 'A safe space to discuss anxiety and share coping strategies',
    memberCount: 234,
    category: 'Mental Health',
    isPrivate: false,
  },
  {
    id: '2',
    name: 'Study Stress',
    description: 'Managing academic pressure and exam stress',
    memberCount: 156,
    category: 'Academic',
    isPrivate: false,
  },
  {
    id: '3',
    name: 'Social Anxiety',
    description: 'Support for those dealing with social situations',
    memberCount: 89,
    category: 'Social',
    isPrivate: true,
  },
  {
    id: '4',
    name: 'Mindfulness Practice',
    description: 'Daily mindfulness and meditation practice',
    memberCount: 312,
    category: 'Wellness',
    isPrivate: false,
  },
];

export const emergencyContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'NIMHANS Helpline',
    phone: '1800-599-0019',
    description: '24x7 mental health crisis support',
    type: 'crisis',
    isNational: true,
  },
  {
    id: '2',
    name: 'iCall (TISS)',
    phone: '+91 9152987821',
    description: '24x7 psychosocial helpline',
    type: 'crisis',
    isNational: true,
  },
  {
    id: '3',
    name: 'Campus Counseling Center',
    phone: '911-246-3040',
    description: 'On-campus crisis support',
    type: 'crisis',
    isNational: false,
  },
  {
    id: '4',
    name: 'Vandrevala Foundation',
    phone: '9999666555',
    description: '24x7 free counseling support',
    type: 'support',
    isNational: true,
  },
  {
    id: '5',
    name: 'Sneha India',
    phone: '044-24640050',
    description: 'Emotional support helpline',
    type: 'support',
    isNational: true,
  },
];

export const mockWellnessActivities: WellnessActivity[] = [
  {
    id: '1',
    title: '5-Minute Deep Breathing',
    description: 'Quick breathing exercise to reduce stress and anxiety.',
    type: 'breathing',
    duration: 5,
    instructions: [
      'Find a comfortable seated position',
      'Close your eyes and relax your shoulders',
      'Breathe in slowly through your nose for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly through your mouth for 6 counts',
      'Repeat for 5 minutes'
    ],
    category: 'Quick Relief',
  },
  {
    id: '2',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematic relaxation technique for stress relief.',
    type: 'exercise',
    duration: 20,
    instructions: [
      'Lie down in a comfortable position',
      'Start with your toes - tense for 5 seconds, then relax',
      'Move up to your calves, thighs, abdomen',
      'Continue with arms, shoulders, neck, and face',
      'Notice the difference between tension and relaxation',
      'End with 5 minutes of deep breathing'
    ],
    category: 'Stress Management',
  },
  {
    id: '3',
    title: 'Gratitude Journaling',
    description: 'Daily practice to improve mood and perspective.',
    type: 'journaling',
    duration: 10,
    instructions: [
      'Get a notebook or use your phone',
      'Write down 3 things you\'re grateful for today',
      'Be specific about why you\'re grateful',
      'Include small and big things',
      'Reflect on how these things made you feel',
      'Make this a daily habit'
    ],
    category: 'Mood Enhancement',
  },
  {
    id: '4',
    title: 'Mindful Walking',
    description: 'Combine physical activity with mindfulness practice.',
    type: 'mindfulness',
    duration: 15,
    instructions: [
      'Choose a quiet path or space',
      'Start walking at a slow, comfortable pace',
      'Focus on the sensation of your feet touching the ground',
      'Notice your surroundings without judgment',
      'When your mind wanders, gently return focus to walking',
      'End with a moment of appreciation'
    ],
    category: 'Mindfulness',
  },
];

export const assessmentQuestions = [
  {
    id: 1,
    question: 'Little interest or pleasure in doing things',
    category: 'depression'
  },
  {
    id: 2,
    question: 'Feeling down, depressed, or hopeless',
    category: 'depression'
  },
  {
    id: 3,
    question: 'Trouble falling or staying asleep, or sleeping too much',
    category: 'depression'
  },
  {
    id: 4,
    question: 'Feeling tired or having little energy',
    category: 'depression'
  },
  {
    id: 5,
    question: 'Poor appetite or overeating',
    category: 'depression'
  },
  {
    id: 6,
    question: 'Feeling bad about yourself or that you are a failure',
    category: 'depression'
  },
  {
    id: 7,
    question: 'Trouble concentrating on things, such as reading or watching TV',
    category: 'depression'
  },
  {
    id: 8,
    question: 'Thoughts that you would be better off dead, or of hurting yourself',
    category: 'depression'
  },
  {
    id: 9,
    question: 'Feeling nervous, anxious, or on edge',
    category: 'anxiety'
  },
  {
    id: 10,
    question: 'Not being able to stop or control worrying',
    category: 'anxiety'
  },
  {
    id: 11,
    question: 'Worrying too much about different things',
    category: 'anxiety'
  },
  {
    id: 12,
    question: 'Trouble relaxing',
    category: 'anxiety'
  },
  {
    id: 13,
    question: 'Feeling constantly under strain',
    category: 'general'
  },
  {
    id: 14,
    question: 'Unable to enjoy your normal day-to-day activities',
    category: 'general'
  },
  {
    id: 15,
    question: 'Feeling unhappy and depressed',
    category: 'general'
  },
];

export const assessmentOptions = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const calculateRiskLevel = (score: number): 'minimal' | 'moderate' | 'high' => {
  if (score <= 10) return 'minimal';
  if (score <= 25) return 'moderate';
  return 'high';
};

export const getRiskLevelColor = (riskLevel: 'minimal' | 'moderate' | 'high'): string => {
  switch (riskLevel) {
    case 'minimal': return '#00B894'; // green
    case 'moderate': return '#FDCB6E'; // yellow
    case 'high': return '#E17055'; // red
    default: return '#636E72'; // gray
  }
};

export const getRiskLevelMessage = (score: number, riskLevel: 'minimal' | 'moderate' | 'high'): string => {
  switch (riskLevel) {
    case 'minimal':
      return 'Your responses suggest minimal stress levels. Keep up the good work with self-care!';
    case 'moderate':
      return 'Your responses indicate moderate stress. Consider trying our wellness activities and resources.';
    case 'high':
      return 'Your responses suggest you may benefit from professional support. We recommend speaking with a counselor.';
    default:
      return 'Assessment completed.';
  }
};

export const mockCounselors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specializations: ['Anxiety', 'Depression', 'Academic Stress'],
    experience: '8 years',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
    availability: 'Mon-Fri 9AM-5PM',
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specializations: ['PTSD', 'Trauma', 'Relationship Issues'],
    experience: '12 years',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
    availability: 'Tue-Sat 10AM-6PM',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem'],
    experience: '6 years',
    avatar: 'https://images.unsplash.com/photo-1594824388853-d0c2d8e8b6b8?w=100&h=100&fit=crop&crop=face',
    availability: 'Mon-Thu 11AM-7PM',
    rating: 4.9,
  },
];

export const mockVolunteers = [
  {
    id: '1',
    name: 'Alex Thompson',
    volunteerType: 'Peer Support',
    availability: 'Online',
    specialties: ['Academic Stress', 'Social Anxiety'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '2',
    name: 'Maya Patel',
    volunteerType: 'Crisis Support',
    availability: 'Online',
    specialties: ['Depression', 'Loneliness'],
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6d4e6b8?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: '3',
    name: 'Jordan Kim',
    volunteerType: 'Peer Support',
    availability: 'Online',
    specialties: ['Study Stress', 'Time Management'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
];