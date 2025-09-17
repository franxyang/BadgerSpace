import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: 'USER' | 'ADMIN'
    } & DefaultSession['user']
  }
}

