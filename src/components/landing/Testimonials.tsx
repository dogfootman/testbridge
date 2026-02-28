'use client'

export function Testimonials() {
  const testimonials = [
    {
      author: '김OO 개발자',
      text: '3일 만에 14명 모집 완료, 정말 빠르고 편리했어요',
      role: 'developer',
    },
    {
      author: '박OO 테스터',
      text: '앱 테스트하고 리워드까지, 일석이조입니다',
      role: 'tester',
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
          실제 사용자 후기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <blockquote className="mb-4">
                <p className="text-lg text-gray-700 italic">
                  "{testimonial.text}"
                </p>
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role === 'developer' ? '개발자' : '테스터'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
