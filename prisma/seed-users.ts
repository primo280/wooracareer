import { sql } from '../lib/database'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Starting users seed...');

  try {
    // Clear existing users (optional)
    console.log('🧹 Clearing existing users...');
    await sql`DELETE FROM users_sync`;

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    

    // Create admin user
    await sql`
      INSERT INTO users_sync (id, email, name, role, image, "passwordHash", "createdAt", "updatedAt")
      VALUES (
        'user-admin-1',
        'admin@wooracareer.com',
        'Admin User',
        'ADMIN',
        'https://avatar.iran.liara.run/public/admin',
        ${adminPassword},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Created/Updated admin user');

   ;
  } catch (error) {
    console.error('❌ Error during users seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
