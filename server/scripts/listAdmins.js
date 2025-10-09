import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function listAdmins() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get all admins
    console.log('🔍 Fetching all admins...');
    const admins = await Admin.find({}).sort({ createdAt: -1 });

    if (admins.length === 0) {
      console.log('📭 No admins found in the database.');
      process.exit(0);
    }

    console.log(`📋 Found ${admins.length} admin(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin Details:`);
      console.log('   =================');
      console.log(`   ID: ${admin._id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Gender: ${admin.gender}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Terms Accepted: ${admin.acceptTerms ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleString()}`);
      console.log(`   Updated: ${admin.updatedAt.toLocaleString()}`);
      console.log('');
    });

    console.log('🎉 Admin listing completed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    process.exit(1);
  }
}

console.log('🚀 Admin Listing Tool');
console.log('====================\n');

listAdmins();
