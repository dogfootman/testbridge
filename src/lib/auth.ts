import { getServerSession } from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

// @TEST P2-S3-V.3 & P2-S3-V.4 - 역할별 리다이렉트
// @SPEC specs/screens/login.yaml

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-expect-error - role is not in default session type
        session.user.role = user.role
      }
      return session
    },
    // 로그인 후 리다이렉트 처리
    async redirect({ url, baseUrl }) {
      // 상대 URL 처리
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // 같은 도메인인 경우만 리다이렉트
      else if (new URL(url).origin === baseUrl) return url

      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/',
    error: '/auth/error',
  },
}

export const getSession = () => getServerSession(authOptions)
