'use client'

import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          Google Play 테스트 요건, 더 이상 고민하지 마세요
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-blue-100 animate-fade-in-delay-1">
          14일 / 14명 테스터를 쉽고 빠르게
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
          <Link
            href="/auth/signup?role=developer"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg w-full sm:w-auto"
          >
            개발자로 시작
          </Link>
          <Link
            href="/auth/signup?role=tester"
            className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            테스터로 시작
          </Link>
        </div>
      </div>
    </section>
  )
}
