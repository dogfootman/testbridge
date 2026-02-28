import { render, screen } from '@testing-library/react'
import { FlowVisualization } from './FlowVisualization'
import '@testing-library/jest-dom'

describe('FlowVisualization', () => {
  it('should render 4 steps', () => {
    render(<FlowVisualization />)

    expect(screen.getByText('앱 등록')).toBeInTheDocument()
    expect(screen.getByText('테스터 매칭')).toBeInTheDocument()
    expect(screen.getByText('테스트 진행')).toBeInTheDocument()
    expect(screen.getByText('프로덕션 등록')).toBeInTheDocument()
  })

  it('should render step descriptions', () => {
    render(<FlowVisualization />)

    expect(screen.getByText(/30초 안에 앱 등록 및 테스터 모집/i)).toBeInTheDocument()
    expect(screen.getByText(/자동 매칭 & 승인, 14명 선정/i)).toBeInTheDocument()
    expect(screen.getByText(/14일간 실시간 현황 모니터링/i)).toBeInTheDocument()
    expect(screen.getByText(/요건 충족 시 Google Play 등록/i)).toBeInTheDocument()
  })

  it('should display step numbers', () => {
    render(<FlowVisualization />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should have section heading', () => {
    render(<FlowVisualization />)

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
