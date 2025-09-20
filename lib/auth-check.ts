import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:", missing)
    return false
  }

  console.log("✅ All required environment variables are set")
  return true
}

export async function validateProductionSetup() {
  console.log("🔍 Validating production setup...")

  const envCheck = checkEnvironmentVariables()
  const dbCheck = await checkDatabaseConnection()

  if (!envCheck || !dbCheck) {
    console.error("❌ Production setup validation failed")
    return false
  }

  console.log("✅ Production setup validation successful")
  return true
}
