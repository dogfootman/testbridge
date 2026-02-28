import { render, screen, fireEvent } from '@testing-library/react'
import { FAQSection } from './FAQSection'
import '@testing-library/jest-dom'

describe('FAQSection', () => {
  it('should render section heading', () => {
    render(<FAQSection />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('should render FAQ questions', () => {
    render(<FAQSection />)

    expect(screen.getByText(/Google Play 테스트 요건이 뭔가요?/i)).toBeInTheDocument()
    expect(screen.getByText(/테스트 비용은 얼마인가요?/i)).toBeInTheDocument()
  })

  it('should initially hide answers', () => {
    render(<FAQSection />)

    const answer1 = screen.queryByText(/프로덕션 등록 전 14일간 14명 이상의 테스터/i)
    expect(answer1).not.toBeInTheDocument()
  })

  it('should show answer when question is clicked', () => {
    render(<FAQSection />)

    const question = screen.getByText(/Google Play 테스트 요건이 뭔가요?/i)
    fireEvent.click(question)

    const answer = screen.getByText(/프로덕션 등록 전 14일간 14명 이상의 테스터/i)
    expect(answer).toBeInTheDocument()
  })

  it('should toggle answer on multiple clicks', () => {
    render(<FAQSection />)

    const question = screen.getByText(/Google Play 테스트 요건이 뭔가요?/i)

    // First click - open
    fireEvent.click(question)
    expect(screen.getByText(/프로덕션 등록 전 14일간 14명 이상의 테스터/i)).toBeInTheDocument()

    // Second click - close
    fireEvent.click(question)
    expect(screen.queryByText(/프로덕션 등록 전 14일간 14명 이상의 테스터/i)).not.toBeInTheDocument()
  })

  it('should render second FAQ item', () => {
    render(<FAQSection />)

    const question = screen.getByText(/테스트 비용은 얼마인가요?/i)
    fireEvent.click(question)

    const answer = screen.getByText(/유료 리워드 또는 상호 테스트.*방식으로 선택 가능합니다/i)
    expect(answer).toBeInTheDocument()
  })
})
