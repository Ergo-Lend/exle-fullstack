'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote:
      "Sarah, an Entrepreneur from Kenya, achieved her dream with EXLE's support. Creating a compelling loan request, she garnered community contributions to fund her sustainable fashion venture.\n\nWith the borrowed funds, Sarah brought her vision to life, supporting local artisans. Her business success not only facilitated loan repayment but also inspired the EXLE community. Join us to turn your aspirations into reality!",
    author: 'Sarah',
    role: 'Entrepreneur, Kenya',
  },
  {
    quote:
      "EXLE is a paradigm shift in how we can handle people's real life financing needs. In a world where billions of people don't have access to basic financial services, blockchain technology, specifically Ergo brings us closer to a solution that can have a global impact that also empowers the community.",
    author: 'Community Member',
    role: 'Ergo Ecosystem',
  },
  {
    quote:
      "As a small business owner in Brazil, traditional banks turned me away. EXLE gave me the opportunity to secure funding from people who believed in my vision. The transparent smart contracts gave both me and my lenders confidence. I've since repaid my loan and continue to grow my business.",
    author: 'Marco',
    role: 'Small Business Owner, Brazil',
  },
]

export function CommunitySection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const goToSlide = useCallback((index: number, dir: 'left' | 'right') => {
    if (isAnimating) return
    setDirection(dir)
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setTimeout(() => setIsAnimating(false), 50)
    }, 300)
  }, [isAnimating])

  const nextSlide = useCallback(() => {
    const next = (currentIndex + 1) % testimonials.length
    goToSlide(next, 'right')
  }, [currentIndex, goToSlide])

  const prevSlide = useCallback(() => {
    const prev = (currentIndex - 1 + testimonials.length) % testimonials.length
    goToSlide(prev, 'left')
  }, [currentIndex, goToSlide])

  // Auto-advance every 8 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 8000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const current = testimonials[currentIndex]

  return (
    <section className="w-full py-16 md:py-24">
      <h2 className="mb-12 text-3xl font-bold md:text-4xl">
        Hear from our<br />Community
      </h2>

      <div className="relative overflow-hidden">
        <div
          className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-12 transition-all duration-300 ease-in-out ${
            isAnimating
              ? direction === 'right'
                ? '-translate-x-4 opacity-0'
                : 'translate-x-4 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
        >
          <div className="flex-1">
            <div className="relative">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 text-exle-accent"
              >
                <path
                  d="M10.667 14.667H4V8h6.667v6.667zm0 0v4c0 3.682 2.985 6.666 6.666 6.666M21.333 14.667H28V8h-6.667v6.667zm0 0v4c0 3.682-2.985 6.666-6.666 6.666"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <blockquote className="text-base leading-relaxed text-muted-foreground md:text-lg whitespace-pre-line">
                {current.quote}
              </blockquote>
              <div className="mt-6">
                <p className="font-semibold">{current.author}</p>
                <p className="text-sm text-muted-foreground">{current.role}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 md:flex md:justify-end">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-exle-accent/20 to-exle-secondary/20 md:h-80 md:w-96">
              {/* EXLE decorative pattern */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 384 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Diamond shapes */}
                <path
                  d="M192 40L312 160L192 280L72 160L192 40Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-exle-accent/30"
                  fill="none"
                />
                <path
                  d="M192 80L272 160L192 240L112 160L192 80Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-exle-accent/40"
                  fill="none"
                />
                <path
                  d="M192 120L232 160L192 200L152 160L192 120Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-exle-accent/50"
                  fill="none"
                />
                {/* EXLE text */}
                <text
                  x="192"
                  y="170"
                  textAnchor="middle"
                  className="fill-exle-accent/20"
                  fontSize="48"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  EXLE
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {/* Dot indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index, index > currentIndex ? 'right' : 'left')}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-exle-accent'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-muted-foreground/30 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
