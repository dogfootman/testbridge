import { render, screen } from '@testing-library/react'
import { Header } from './Header'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('Header Component', () => {
  beforeEach(() => {
    const { useSession } = require('next-auth/react')
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
  })

  describe('RED: Basic Structure', () => {
    it('should render navigation element', () => {
      render(<Header />)
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should render logo/brand', () => {
      render(<Header />)
      const logo = screen.getByText(/TestBridge/i)
      expect(logo).toBeInTheDocument()
    })

    it('should render main navigation links', () => {
      render(<Header />)
      // These should fail initially
      expect(screen.getByText(/개발자/i)).toBeInTheDocument()
      expect(screen.getByText(/테스터/i)).toBeInTheDocument()
    })
  })

  describe('RED: Authentication State', () => {
    it('should show login button when not authenticated', () => {
      render(<Header />)
      const loginButton = screen.getByRole('link', { name: /로그인/i })
      expect(loginButton).toBeInTheDocument()
      expect(loginButton).toHaveAttribute('href', '/auth/login')
    })

    it('should show user menu when authenticated', () => {
      const { useSession } = require('next-auth/react')
      useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'DEVELOPER',
          },
        },
        status: 'authenticated',
      })

      render(<Header />)
      expect(screen.getByText(/Test User/i)).toBeInTheDocument()
    })

    it('should show logout link when authenticated', () => {
      const { useSession } = require('next-auth/react')
      useSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      })

      render(<Header />)
      expect(screen.getByText(/로그아웃/i)).toBeInTheDocument()
    })
  })

  describe('RED: Responsive Design', () => {
    it('should have mobile menu button on mobile', () => {
      render(<Header />)
      const mobileMenuButton = screen.getByLabelText(/메뉴 열기/i)
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('should apply sticky positioning', () => {
      render(<Header />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toMatch(/sticky/i)
    })
  })
})
