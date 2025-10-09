import mongoose from 'mongoose';
import { checkTegaExamPaymentUtil } from './src/controllers/paymentController.js';

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

const testTegaPaymentDetection = async () => {
  try {
    await connectDB();
    
    console.log('\n🧪 Testing TEGA Exam Payment Detection...\n');
    
    // Test with a sample user ID (you can replace this with an actual user ID)
    const testUserId = '68d27254a697da05f493b9aa'; // Replace with actual user ID
    
    console.log(`🔍 Testing payment detection for user: ${testUserId}`);
    
    const result = await checkTegaExamPaymentUtil(testUserId);
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log('Success:', result.success);
    console.log('Has Paid for TEGA Exam:', result.hasPaidForTegaExam);
    console.log('Payment Source:', result.paymentSource);
    console.log('Payment Details:', result.paymentDetails);
    
    if (result.hasPaidForTegaExam) {
      console.log('\n✅ SUCCESS: User has paid for TEGA exam');
      console.log('🎯 This user should be able to access TEGA exams');
    } else {
      console.log('\n❌ RESULT: User has not paid for TEGA exam');
      console.log('🎯 This user needs to pay before accessing TEGA exams');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testTegaPaymentDetection();
