const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

async function testDatabaseConnection() {
  console.log("Testing database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return;
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Test simple query
    const result = await sql`SELECT 1 as test`;
    console.log("Database connection successful:", result);

  // Test if tables exist
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables in database:", tables.map(t => t.table_name));

    // Test if jobs exist
    const jobs = await sql`SELECT id, title, status FROM jobs`;
    console.log("Jobs in database:", jobs);

  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

testDatabaseConnection();
