import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobRoutes.js';

// Load environment variables
dotenv.config();
console.log('Server starting...');
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI ? '***** (present)' : 'NOT SET');
console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET ? '***** (present)' : 'NOT SET');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow your frontend URLs
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tega-auth-starter';
    
    // MongoDB connection options with increased timeout and buffering enabled
    const options = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: true, // Enable buffering to prevent the error
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };
    
    console.log('🔌 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, options);
    console.log('✅ Connected to MongoDB successfully');
    
    // Verify connection
    const state = mongoose.connection.readyState;
    console.log(`📊 MongoDB connection state: ${state} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will start but some features may not work without database');
    console.log('💡 To fix this:');
    console.log('   1. Install MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('   2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('   3. Or set MONGODB_URI environment variable');
    console.log('   4. Check if MongoDB service is running');
    throw err; // Re-throw to prevent server startup
  }
};

// Routes
// Import routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import principalRoutes from './routes/principalRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import razorpayRoutes from './routes/razorpayRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import examRoutes from './routes/examRoutes.js';
import questionPaperRoutes from './routes/questionPaperRoutes.js';
import tegaExamPaymentRoutes from './routes/tegaExamPaymentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';
import studentProgressRoutes from './routes/studentProgressRoutes.js';
import adminCourseRoutes from './routes/adminCourseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import adminExamResultRoutes from './routes/adminExamResultRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';



// Use routes
app.use("/api/jobs", jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/principal', principalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/question-papers', questionPaperRoutes);
app.use('/api/tega-exam-payments', tegaExamPaymentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin/exam-results', adminExamResultRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);


// Note: Public course access is now handled by courseRoutes.js

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Tega Auth Starter API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test endpoint for CORS
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS is working! Server is responding correctly.',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  console.error('Error stack:', err.stack);
  
  // Handle Multer errors
  if (err.name === 'MulterError') {
    console.error('Multer error detected:', err.message);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle custom multer errors (from fileFilter)
  if (err.message && err.message.includes('Only')) {
    console.error('File type validation error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5001;

// Start server only after database connection is established
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Database connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
