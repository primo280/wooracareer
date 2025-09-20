import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@/lib/generated/prisma"
import { validateProductionSetup } from "@/lib/auth-check"
import bcrypt from "bcryptjs"

const { compare } = bcrypt

const prisma = new PrismaClient()

// Validate production setup on startup
if (process.env.NODE_ENV === "production") {
  validateProductionSetup().then(success => {
    if (!success) {
      console.error("🚨 Production setup validation failed - authentication may not work properly")
    }
  })
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            console.error("User not found:", credentials.email)
            return null
          }

          const isValid = await compare(credentials.password, user.passwordHash || "")
          if (!isValid) {
            console.error("Invalid password for user:", credentials.email)
            return null
          }

          console.log("User authenticated successfully:", user.email, "Role:", user.role)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "database" as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    async session({ session, token, user }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }: any) {
      console.log("Sign in attempt:", user?.email, "Role:", user?.role)
      return true
    }
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code: any, metadata: any) {
      console.error("NextAuth Error:", code, metadata)
    },
    warn(code: any) {
      console.warn("NextAuth Warning:", code)
    },
    debug(code: any, metadata: any) {
      console.debug("NextAuth Debug:", code, metadata)
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
