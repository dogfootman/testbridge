'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface SidebarProps {
  categories?: Category[]
  onCategoryChange?: (selectedIds: string[]) => void
}

export function Sidebar({ categories = [], onCategoryChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]

    setSelectedCategories(newSelected)
    onCategoryChange?.(newSelected)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isOpen ? 'block' : 'hidden'
        } hidden md:block bg-white border-r border-gray-200 w-64 min-h-screen p-6`}
        role="complementary"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">필터</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700"
            aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              카테고리
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Additional Filters Placeholder */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            리워드 범위
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">5,000원 미만</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">5,000 - 10,000원</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">10,000원 이상</span>
            </label>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 md:hidden bg-blue-500 text-white p-3 rounded-full shadow-lg"
          aria-label="사이드바 열기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </>
  )
}
