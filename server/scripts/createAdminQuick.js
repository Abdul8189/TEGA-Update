import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminQuick() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('❌ Usage: node createAdminQuick.js <username> <email> <password> [gender]');
      console.log('📝 Example: node createAdminQuick.js john john@example.com mypassword123 Male');
      console.log('📝 Gender is optional (defaults to Male)');
      process.exit(1);
    }

    const [username, email, password, gender = 'Male'] = args;

    // Validate inputs
    if (!username || !email || !password) {
      console.log('❌ Username, email, and password are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format!');
      process.exit(1);
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
      console.log('❌ Gender must be Male, Female, or Other!');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const existingAdmin = await Admin.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists!');
      if (existingAdmin.email === email.toLowerCase()) {
        console.log(`   Email: ${existingAdmin.email}`);
      }
      if (existingAdmin.username === username) {
        console.log(`   Username: ${existingAdmin.username}`);
      }
      process.exit(0);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    // Create new admin
    console.log('👤 Creating new admin...');
    const admin = new Admin({
      username: username,
      email: email.toLowerCase(),
      gender: gender,
      acceptTerms: true,
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin created successfully!\n');

    console.log('📋 Admin Details:');
    console.log('================');
    console.log(`ID: ${admin._id}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Gender: ${admin.gender}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`Created: ${admin.createdAt}`);

    console.log('\n🔑 Login Credentials:');
    console.log('====================');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log('\n🌐 Login URL: /admin/login');

    console.log('\n🎉 Admin creation completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.log('💡 This error usually means the username or email already exists.');
    }
    process.exit(1);
  }
}

console.log('🚀 Quick Admin Creation Tool');
console.log('============================\n');

createAdminQuick();
