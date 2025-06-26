const fs = require('fs');
const path = require('path');
const database = require('./database');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Ensure database directory exists
    const dbDir = path.dirname(process.env.DB_PATH || './database/learning_platform.db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    await database.connect();

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await database.run(statement);
      }
    }

    console.log('✅ Database schema created successfully');

    // Read and execute seeds
    const runSeed = require('../../database/seed_with_debug.js'); // Adjust path if needed
    await runSeed();
    console.log('🎉 All seeds inserted successfully');

    //  const seedsPath = path.join(__dirname, '../../database/seed.sql');
    // if (fs.existsSync(seedsPath)) {
    //   const seeds = fs.readFileSync(seedsPath, 'utf8');
    //   const seedStatements = seeds.split(';').filter(stmt => stmt.trim());
      
    //   for (const statement of seedStatements) {
    //     if (statement.trim()) {
    //       await database.run(statement);
    //     }
    //   }
      
    //   console.log('✅ Database seeded successfully');

    // }

    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await database.close();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;