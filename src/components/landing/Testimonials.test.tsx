import { render, screen } from '@testing-library/react'
import { Testimonials } from './Testimonials'
import '@testing-library/jest-dom'

describe('Testimonials', () => {
  it('should render section heading', () => {
    render(<Testimonials />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render developer testimonial', () => {
    render(<Testimonials />)

    expect(screen.getByText(/3일 만에 14명 모집 완료, 정말 빠르고 편리했어요/i)).toBeInTheDocument()
    expect(screen.getByText(/김OO 개발자/i)).toBeInTheDocument()
  })

  it('should render tester testimonial', () => {
    render(<Testimonials />)

    expect(screen.getByText(/앱 테스트하고 리워드까지, 일석이조입니다/i)).toBeInTheDocument()
    expect(screen.getByText(/박OO 테스터/i)).toBeInTheDocument()
  })

  it('should display both testimonials', () => {
    const { container } = render(<Testimonials />)

    const testimonials = container.querySelectorAll('blockquote')
    expect(testimonials).toHaveLength(2)
  })
})
