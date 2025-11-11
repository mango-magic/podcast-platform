// Database migration script to add persona, vertical, and profileCompleted fields to users table
// Run this script once to update existing database schema

const { sequelize, User } = require('./models');

async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name IN ('persona', 'vertical', 'profileCompleted')
    `);
    
    const existingColumns = results.map(r => r.column_name);
    
    // Add persona column if it doesn't exist
    if (!existingColumns.includes('persona')) {
      console.log('Adding persona column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN persona VARCHAR(255) CHECK (persona IN (
          'CISO', 'CRO', 'CFO', 'CHRO', 'COO', 'CMO', 'CTO', 
          'VP Supply Chain', 'CSO', 'General Counsel'
        ))
      `);
      console.log('✓ persona column added');
    } else {
      console.log('✓ persona column already exists');
    }
    
    // Add vertical column if it doesn't exist
    if (!existingColumns.includes('vertical')) {
      console.log('Adding vertical column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN vertical VARCHAR(255) CHECK (vertical IN (
          'SaaS', 'Banking', 'Insurance', 'Healthcare Providers', 
          'Pharma', 'CPG', 'Automotive', 'eCommerce', 'Logistics', 'Renewables'
        ))
      `);
      console.log('✓ vertical column added');
    } else {
      console.log('✓ vertical column already exists');
    }
    
    // Add profileCompleted column if it doesn't exist
    if (!existingColumns.includes('profileCompleted')) {
      console.log('Adding profileCompleted column...');
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN "profileCompleted" BOOLEAN DEFAULT FALSE
      `);
      console.log('✓ profileCompleted column added');
    } else {
      console.log('✓ profileCompleted column already exists');
    }
    
    // Update profileCompleted for users who already have persona and vertical
    console.log('Updating profileCompleted for existing users...');
    await sequelize.query(`
      UPDATE users 
      SET "profileCompleted" = TRUE 
      WHERE persona IS NOT NULL 
      AND vertical IS NOT NULL 
      AND "profileCompleted" = FALSE
    `);
    console.log('✓ Updated existing user profiles');
    
    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateDatabase();

