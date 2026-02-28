import { render, screen } from '@testing-library/react'
import { CTAFooter } from './CTAFooter'
import '@testing-library/jest-dom'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('CTAFooter', () => {
  it('should render call to action heading', () => {
    render(<CTAFooter />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render both CTA buttons', () => {
    render(<CTAFooter />)

    expect(screen.getByText('개발자로 시작')).toBeInTheDocument()
    expect(screen.getByText('테스터로 시작')).toBeInTheDocument()
  })

  it('should link to developer signup', () => {
    render(<CTAFooter />)

    const devButton = screen.getByText('개발자로 시작').closest('a')
    expect(devButton).toHaveAttribute('href', '/auth/signup?role=developer')
  })

  it('should link to tester signup', () => {
    render(<CTAFooter />)

    const testerButton = screen.getByText('테스터로 시작').closest('a')
    expect(testerButton).toHaveAttribute('href', '/auth/signup?role=tester')
  })

  it('should have primary background color', () => {
    const { container } = render(<CTAFooter />)

    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-blue-500')
  })
})
