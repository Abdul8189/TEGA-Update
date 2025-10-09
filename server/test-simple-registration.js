import mongoose from 'mongoose';
import Exam from './src/models/Exam.js';
import ExamRegistration from './src/models/ExamRegistration.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tega-education');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testSimpleRegistration = async () => {
  try {
    await connectDB();
    
    console.log('\n🧪 Testing Simple Exam Registration...\n');
    
    // Find the TEGA exam
    const tegaExam = await Exam.findOne({
      $or: [
        { isTegaExam: true },
        { title: { $regex: /tega.*main/i } }
      ]
    });
    
    if (!tegaExam) {
      console.log('❌ No TEGA exam found');
      return;
    }
    
    console.log('🔍 Found TEGA exam:', tegaExam.title);
    console.log('🔍 Exam ID:', tegaExam._id);
    console.log('🔍 Requires Payment:', tegaExam.requiresPayment);
    console.log('🔍 Price:', tegaExam.price);
    console.log('🔍 Slots:', tegaExam.slots?.length || 0);
    
    // Test basic exam registration logic
    const testStudentId = '68d27254a697da05f493b9aa'; // Your user ID
    
    console.log('\n🔍 Testing registration for student:', testStudentId);
    
    // Check if already registered
    const existingRegistration = await ExamRegistration.findOne({
      studentId: testStudentId,
      examId: tegaExam._id,
      isActive: true
    });
    
    if (existingRegistration) {
      console.log('⚠️  Student already registered for this exam');
      console.log('🔍 Registration details:', {
        registrationId: existingRegistration._id,
        slotId: existingRegistration.slotId,
        registrationDate: existingRegistration.registrationDate
      });
    } else {
      console.log('✅ Student not registered - can proceed with registration');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error stack:', error.stack);
    process.exit(1);
  }
};

testSimpleRegistration();
