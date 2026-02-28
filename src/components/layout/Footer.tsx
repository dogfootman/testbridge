'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TestBridge</h3>
            <p className="text-gray-400 text-sm">
              Google Play 테스터 매칭 플랫폼
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">개발자</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/developer" className="text-gray-400 hover:text-white transition-colors">
                  대시보드
                </Link>
              </li>
              <li>
                <Link href="/developer/apps/new" className="text-gray-400 hover:text-white transition-colors">
                  앱 등록
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">테스터</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tester" className="text-gray-400 hover:text-white transition-colors">
                  대시보드
                </Link>
              </li>
              <li>
                <Link href="/tester/apps" className="text-gray-400 hover:text-white transition-colors">
                  앱 탐색
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-400 text-sm">
            &copy; 2026 TestBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
