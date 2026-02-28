'use client'

import Link from 'next/link'

export function CTAFooter() {
  return (
    <section className="bg-blue-500 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
          지금 바로 시작하세요
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
