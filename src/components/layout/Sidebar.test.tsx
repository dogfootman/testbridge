import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from './Sidebar'

describe('Sidebar Component', () => {
  describe('RED: Basic Structure', () => {
    it('should render aside element', () => {
      render(<Sidebar />)
      const aside = screen.getByRole('complementary')
      expect(aside).toBeInTheDocument()
    })

    it('should render filter section title', () => {
      render(<Sidebar />)
      expect(screen.getByText(/필터/i)).toBeInTheDocument()
    })
  })

  describe('RED: Filter Categories', () => {
    it('should render category filters', () => {
      const categories = [
        { id: '1', name: '게임', slug: 'game' },
        { id: '2', name: '유틸리티', slug: 'utility' },
      ]

      render(<Sidebar categories={categories} />)
      expect(screen.getByText('게임')).toBeInTheDocument()
      expect(screen.getByText('유틸리티')).toBeInTheDocument()
    })

    it('should handle category selection', () => {
      const categories = [
        { id: '1', name: '게임', slug: 'game' },
      ]
      const onCategoryChange = jest.fn()

      render(
        <Sidebar categories={categories} onCategoryChange={onCategoryChange} />
      )

      const categoryCheckbox = screen.getByLabelText('게임')
      fireEvent.click(categoryCheckbox)

      expect(onCategoryChange).toHaveBeenCalledWith(['1'])
    })
  })

  describe('RED: Collapsible Behavior', () => {
    it('should toggle sidebar visibility', () => {
      render(<Sidebar />)

      const toggleButton = screen.getByLabelText(/사이드바 닫기/i)
      expect(toggleButton).toBeInTheDocument()

      fireEvent.click(toggleButton)

      const closedButton = screen.getByLabelText(/사이드바 열기/i)
      expect(closedButton).toBeInTheDocument()
    })
  })

  describe('RED: Responsive Design', () => {
    it('should be hidden on mobile by default', () => {
      const { container } = render(<Sidebar />)
      const aside = container.querySelector('aside')
      expect(aside?.className).toMatch(/hidden.*md:block/i)
    })
  })
})
