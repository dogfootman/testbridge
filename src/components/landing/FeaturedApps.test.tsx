import { render, screen } from '@testing-library/react'
import { FeaturedApps } from './FeaturedApps'
import '@testing-library/jest-dom'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('FeaturedApps', () => {
  const mockApps = [
    { id: 1, appName: 'Test App 1', categoryId: 1, iconUrl: '/icon1.png', rewardAmount: 5000 },
    { id: 2, appName: 'Test App 2', categoryId: 2, iconUrl: '/icon2.png', rewardAmount: 10000 },
    { id: 3, appName: 'Test App 3', categoryId: 1, iconUrl: '/icon3.png', rewardAmount: 7000 },
  ]

  it('should render section heading', () => {
    render(<FeaturedApps apps={mockApps} />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render all app cards', () => {
    render(<FeaturedApps apps={mockApps} />)

    expect(screen.getByText('Test App 1')).toBeInTheDocument()
    expect(screen.getByText('Test App 2')).toBeInTheDocument()
    expect(screen.getByText('Test App 3')).toBeInTheDocument()
  })

  it('should display reward amounts', () => {
    render(<FeaturedApps apps={mockApps} />)

    expect(screen.getByText(/5,000원/)).toBeInTheDocument()
    expect(screen.getByText(/10,000원/)).toBeInTheDocument()
    expect(screen.getByText(/7,000원/)).toBeInTheDocument()
  })

  it('should render app icons', () => {
    render(<FeaturedApps apps={mockApps} />)

    const icons = screen.getAllByRole('img')
    expect(icons).toHaveLength(3)
    expect(icons[0]).toHaveAttribute('alt', 'Test App 1 아이콘')
    expect(icons[1]).toHaveAttribute('alt', 'Test App 2 아이콘')
    expect(icons[2]).toHaveAttribute('alt', 'Test App 3 아이콘')
  })

  it('should show empty state when no apps', () => {
    render(<FeaturedApps apps={[]} />)

    expect(screen.getByText(/모집 중인 앱이 없습니다/i)).toBeInTheDocument()
  })

  it('should link to app detail page', () => {
    render(<FeaturedApps apps={mockApps} />)

    const firstCard = screen.getByText('Test App 1').closest('a')
    expect(firstCard).toHaveAttribute('href', '/tester/apps/1')
  })

  it('should display in grid layout', () => {
    const { container } = render(<FeaturedApps apps={mockApps} />)

    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})
