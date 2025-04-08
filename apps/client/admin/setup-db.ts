import { db } from './server/db';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Initialize admin tables and create default super admin
async function setupAdminTables() {
  console.log('Setting up admin tables...');
  
  try {
    // Check if admin_users table exists by querying
    let adminTableExists = false;
    try {
      const adminCheck = await db.select().from(schema.adminUsers).limit(1);
      adminTableExists = true;
      console.log('Admin tables already exist.');
    } catch (err) {
      console.log('Admin tables do not exist yet, will create them.');
      adminTableExists = false;
    }
    
    if (!adminTableExists) {
      console.log('Creating admin tables through drizzle push...');
      
      // Since we're not using drizzle migration in this example, we'll directly run SQL
      // In a real production environment, you should use drizzle migrations
      await db.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL DEFAULT 'admin',
          last_login TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS admin_activity_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER REFERENCES admin_users(id),
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id INTEGER,
          details JSONB,
          ip_address TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('Admin tables created successfully.');
    }
    
    // Check for super admin user
    const superAdminExists = await db.select()
      .from(schema.adminUsers)
      .where(eq(schema.adminUsers.role, 'super_admin'));
    
    if (superAdminExists.length === 0) {
      console.log('Creating default super admin user...');
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Admin123!@#', saltRounds);
      
      await db.insert(schema.adminUsers).values({
        username: 'superadmin',
        password: hashedPassword,
        email: 'admin@pureflow.com',
        role: 'super_admin'
      });
      
      console.log('Default super admin created with username: superadmin and password: Admin123!@#');
      console.log('IMPORTANT: Change this password immediately after first login!');
    } else {
      console.log('Super admin user already exists');
    }
    
    console.log('Admin database setup complete.');
  } catch (error) {
    console.error('Error setting up admin tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminTables()
  .then(() => {
    console.log('Setup complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });