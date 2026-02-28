'use client'

export function FlowVisualization() {
  const steps = [
    {
      number: 1,
      title: '앱 등록',
      description: '30초 안에 앱 등록 및 테스터 모집',
    },
    {
      number: 2,
      title: '테스터 매칭',
      description: '자동 매칭 & 승인, 14명 선정',
    },
    {
      number: 3,
      title: '테스트 진행',
      description: '14일간 실시간 현황 모니터링',
    },
    {
      number: 4,
      title: '프로덕션 등록',
      description: '요건 충족 시 Google Play 등록',
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          간단한 4단계로 시작하세요
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full font-bold text-xl mb-4 shadow-md">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg
                    className="w-8 h-8 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
