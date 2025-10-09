// Script to migrate in-memory users to MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { inMemoryUsers } from '../src/controllers/authController.js';
import Student from '../src/models/Student.js';

// Load environment variables
dotenv.config();

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tega-auth-starter');
    console.log('✅ Connected to MongoDB');

    console.log(`📊 Found ${inMemoryUsers.size} users in memory`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const [email, userData] of inMemoryUsers) {
      try {
        // Check if user already exists in database
        const existingUser = await Student.findOne({ email });
        
        if (existingUser) {
          console.log(`⏭️  User ${email} already exists in database, skipping`);
          skippedCount++;
          continue;
        }

        // Create new user in database
        const newUser = new Student(userData);
        await newUser.save();
        
        console.log(`✅ Migrated user: ${email} (${userData.firstName} ${userData.lastName})`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${email}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Migrated: ${migratedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`📝 Total in memory: ${inMemoryUsers.size} users`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

migrateUsers();
