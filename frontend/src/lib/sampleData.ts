// Sample data for demonstration
import { Course, StudentProgress, Student } from '@/types';

export const sampleStudent: Student = {
  id: '1',
  email: 'student@questify.com',
  name: 'Alex Johnson',
  role: 'student',
  enrolledCourses: ['1', '2', '3'],
  completedCourses: ['1'],
  totalXP: 3450,
  level: 4,
  streakDays: 12,
  avatar: '',
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-10-07T00:00:00Z'
};

export const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build your first websites.',
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Wilson',
    color: 'cosmic-blue',
    difficulty: 'beginner',
    estimatedHours: 20,
    enrolledStudents: ['1', '2', '3', '4', '5'],
    tags: ['web', 'html', 'css', 'javascript'],
    chapters: [
      {
        id: 'ch1-1',
        courseId: '1',
        title: 'Getting Started with HTML',
        description: 'Learn the basics of HTML structure and syntax',
        order: 1,
        content: 'HTML content here...',
        estimatedMinutes: 45,
        completed: true
      },
      {
        id: 'ch1-2',
        courseId: '1',
        title: 'Styling with CSS',
        description: 'Introduction to CSS and styling web pages',
        order: 2,
        content: 'CSS content here...',
        estimatedMinutes: 60,
        completed: true
      },
      {
        id: 'ch1-3',
        courseId: '1',
        title: 'JavaScript Fundamentals',
        description: 'Basic JavaScript programming concepts',
        order: 3,
        content: 'JavaScript content here...',
        estimatedMinutes: 90,
        completed: true
      }
    ],
    finalExam: {
      id: 'exam1',
      title: 'Web Development Final Exam',
      questions: [],
      timeLimit: 60,
      passingScore: 70,
      attempts: 3,
      type: 'final'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'React & Modern JavaScript',
    description: 'Master React.js and modern JavaScript concepts for building dynamic web applications.',
    teacherId: 'teacher1',
    teacherName: 'Dr. Sarah Wilson',
    color: 'stellar-pink',
    difficulty: 'intermediate',
    estimatedHours: 35,
    enrolledStudents: ['1', '2'],
    tags: ['react', 'javascript', 'frontend'],
    chapters: [
      {
        id: 'ch2-1',
        courseId: '2',
        title: 'React Components',
        description: 'Understanding React components and JSX',
        order: 1,
        content: 'React components content...',
        estimatedMinutes: 75,
        completed: true
      },
      {
        id: 'ch2-2',
        courseId: '2',
        title: 'State Management',
        description: 'Managing state in React applications',
        order: 2,
        content: 'State management content...',
        estimatedMinutes: 90,
        completed: false
      },
      {
        id: 'ch2-3',
        courseId: '2',
        title: 'Hooks and Effects',
        description: 'Using React hooks and side effects',
        order: 3,
        content: 'Hooks content...',
        estimatedMinutes: 85,
        completed: false
      }
    ],
    finalExam: {
      id: 'exam2',
      title: 'React Final Exam',
      questions: [],
      timeLimit: 90,
      passingScore: 75,
      attempts: 2,
      type: 'final'
    },
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Node.js & Backend Development',
    description: 'Build powerful server-side applications with Node.js, Express, and databases.',
    teacherId: 'teacher2',
    teacherName: 'Prof. Michael Chen',
    color: 'nebula-green',
    difficulty: 'intermediate',
    estimatedHours: 40,
    enrolledStudents: ['1'],
    tags: ['nodejs', 'backend', 'express', 'database'],
    chapters: [
      {
        id: 'ch3-1',
        courseId: '3',
        title: 'Node.js Fundamentals',
        description: 'Introduction to Node.js and server-side JavaScript',
        order: 1,
        content: 'Node.js content...',
        estimatedMinutes: 60,
        completed: false
      },
      {
        id: 'ch3-2',
        courseId: '3',
        title: 'Express.js Framework',
        description: 'Building web servers with Express.js',
        order: 2,
        content: 'Express content...',
        estimatedMinutes: 90,
        completed: false
      }
    ],
    finalExam: {
      id: 'exam3',
      title: 'Backend Development Final',
      questions: [],
      timeLimit: 120,
      passingScore: 70,
      attempts: 2,
      type: 'final'
    },
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '4',
    title: 'Python for Data Science',
    description: 'Learn Python programming and data analysis with pandas, numpy, and visualization libraries.',
    teacherId: 'teacher3',
    teacherName: 'Dr. Emily Rodriguez',
    color: 'solar-orange',
    difficulty: 'beginner',
    estimatedHours: 30,
    enrolledStudents: [],
    tags: ['python', 'data-science', 'pandas', 'numpy'],
    chapters: [
      {
        id: 'ch4-1',
        courseId: '4',
        title: 'Python Basics',
        description: 'Python syntax and programming fundamentals',
        order: 1,
        content: 'Python basics content...',
        estimatedMinutes: 90,
        completed: false
      }
    ],
    finalExam: {
      id: 'exam4',
      title: 'Data Science Final',
      questions: [],
      timeLimit: 90,
      passingScore: 75,
      attempts: 3,
      type: 'final'
    },
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'Machine Learning Fundamentals',
    description: 'Introduction to machine learning algorithms, model training, and AI applications.',
    teacherId: 'teacher3',
    teacherName: 'Dr. Emily Rodriguez',
    color: 'galaxy-purple',
    difficulty: 'advanced',
    estimatedHours: 50,
    enrolledStudents: [],
    tags: ['machine-learning', 'ai', 'python', 'algorithms'],
    chapters: [
      {
        id: 'ch5-1',
        courseId: '5',
        title: 'ML Algorithms Overview',
        description: 'Understanding different machine learning algorithms',
        order: 1,
        content: 'ML algorithms content...',
        estimatedMinutes: 120,
        completed: false
      }
    ],
    finalExam: {
      id: 'exam5',
      title: 'Machine Learning Final',
      questions: [],
      timeLimit: 150,
      passingScore: 80,
      attempts: 2,
      type: 'final'
    },
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z'
  }
];

export const sampleProgress: Record<string, StudentProgress> = {
  '1': {
    studentId: '1',
    courseId: '1',
    enrolledAt: '2024-01-15T00:00:00Z',
    completedChapters: ['ch1-1', 'ch1-2', 'ch1-3'],
    chapterScores: {
      'ch1-1': 85,
      'ch1-2': 92,
      'ch1-3': 88
    },
    finalExamScore: 87,
    finalExamAttempts: 1,
    totalTimeSpent: 480, // 8 hours
    lastAccessedAt: '2024-01-30T00:00:00Z',
    completed: true,
    completedAt: '2024-01-30T00:00:00Z'
  },
  '2': {
    studentId: '1',
    courseId: '2',
    enrolledAt: '2024-02-01T00:00:00Z',
    completedChapters: ['ch2-1'],
    chapterScores: {
      'ch2-1': 78
    },
    finalExamAttempts: 0,
    totalTimeSpent: 120, // 2 hours
    lastAccessedAt: '2024-10-06T00:00:00Z',
    completed: false
  },
  '3': {
    studentId: '1',
    courseId: '3',
    enrolledAt: '2024-03-01T00:00:00Z',
    completedChapters: [],
    chapterScores: {},
    finalExamAttempts: 0,
    totalTimeSpent: 30,
    lastAccessedAt: '2024-03-02T00:00:00Z',
    completed: false
  }
};