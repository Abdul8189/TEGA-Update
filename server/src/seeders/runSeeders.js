import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCourses } from './courseSeeder.js';

// Load environment variables
dotenv.config();

const runSeeders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tega-auth-starter');
    console.log('✅ Connected to MongoDB');

    // Run seeders
    console.log('\n🌱 Starting database seeding...\n');

    // Seed courses
    await seedCourses();

    console.log('\n✅ All seeders completed successfully!');
    console.log('🚀 Database is ready for use.');

  } catch (error) {
    console.error('❌ Error running seeders:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeders if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeders();
}

export { runSeeders };
