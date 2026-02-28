'use client'

import Link from 'next/link'
import Image from 'next/image'

interface App {
  id: number
  appName: string
  categoryId: number
  iconUrl: string
  rewardAmount: number
}

interface FeaturedAppsProps {
  apps: App[]
}

export function FeaturedApps({ apps }: FeaturedAppsProps) {
  if (apps.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            최근 모집 중인 앱
          </h2>
          <div className="text-center text-gray-500 py-12">
            모집 중인 앱이 없습니다
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          최근 모집 중인 앱
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/tester/apps/${app.id}`}
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-4">
                  <Image
                    src={app.iconUrl}
                    alt={`${app.appName} 아이콘`}
                    width={64}
                    height={64}
                    className="rounded-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {app.appName}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      카테고리 {app.categoryId}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500">리워드</p>
                    <p className="text-xl font-bold text-blue-600">
                      {app.rewardAmount.toLocaleString()}원
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">모집중</p>
                    <p className="text-sm font-semibold text-green-600">
                      지원하기
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
