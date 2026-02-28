import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'
import '@testing-library/jest-dom'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('HeroSection', () => {
  it('should render main title', () => {
    render(<HeroSection />)

    expect(screen.getByText(/Google Play 테스트 요건, 더 이상 고민하지 마세요/i)).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    render(<HeroSection />)

    expect(screen.getByText(/14일 \/ 14명 테스터를 쉽고 빠르게/i)).toBeInTheDocument()
  })

  it('should render both CTA buttons', () => {
    render(<HeroSection />)

    expect(screen.getByText('개발자로 시작')).toBeInTheDocument()
    expect(screen.getByText('테스터로 시작')).toBeInTheDocument()
  })

  it('should link to developer signup with role parameter', () => {
    render(<HeroSection />)

    const devButton = screen.getByText('개발자로 시작').closest('a')
    expect(devButton).toHaveAttribute('href', '/auth/signup?role=developer')
  })

  it('should link to tester signup with role parameter', () => {
    render(<HeroSection />)

    const testerButton = screen.getByText('테스터로 시작').closest('a')
    expect(testerButton).toHaveAttribute('href', '/auth/signup?role=tester')
  })

  it('should have gradient background styling', () => {
    const { container } = render(<HeroSection />)

    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-gradient-to-br')
  })
})
