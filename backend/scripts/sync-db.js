const { sequelize } = require('./models');

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    console.log('Syncing database models...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database models synced');
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

syncDatabase();

