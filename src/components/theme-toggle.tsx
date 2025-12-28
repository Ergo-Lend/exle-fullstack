'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with same dimensions to prevent layout shift
    return (
      <button className="text-2xl" aria-label="Toggle theme">
        <div className="w-[31px] h-[31px] rounded-full bg-muted" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-2xl"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15.5" cy="15.5" r="15.5" fill="#292837" />
          <path
            d="M15.5 21.1875C18.6411 21.1875 21.1875 18.6411 21.1875 15.5C21.1875 12.3589 18.6411 9.8125 15.5 9.8125C12.3589 9.8125 9.8125 12.3589 9.8125 15.5C9.8125 18.6411 12.3589 21.1875 15.5 21.1875Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21.7475 21.7475L21.6338 21.6338M21.6338 9.36625L21.7475 9.2525L21.6338 9.36625ZM9.2525 21.7475L9.36625 21.6338L9.2525 21.7475ZM15.5 6.82V6.75V6.82ZM15.5 24.25V24.18V24.25ZM6.82 15.5H6.75H6.82ZM24.25 15.5H24.18H24.25ZM9.36625 9.36625L9.2525 9.2525L9.36625 9.36625Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15.5" cy="15.5" r="15.5" fill="#F5F6FB" />
          <path
            d="M15.7967 7.00711C15.9111 7.00711 16.0246 7.00711 16.1372 7.00711C15.0241 8.06818 14.3086 9.49586 14.1151 11.042C13.9216 12.5881 14.2623 14.1549 15.0781 15.47C15.8939 16.7851 17.1332 17.7654 18.5805 18.2404C20.0277 18.7155 21.5915 18.6552 23 18.0702C22.4582 19.4075 21.5727 20.5689 20.4379 21.4305C19.3031 22.292 17.9616 22.8214 16.5566 22.9621C15.1515 23.1029 13.7355 22.8497 12.4597 22.2297C11.1839 21.6096 10.096 20.646 9.31226 19.4414C8.52848 18.2369 8.07814 16.8367 8.00928 15.3902C7.94043 13.9437 8.25563 12.5052 8.92127 11.228C9.58692 9.95087 10.578 8.88304 11.7889 8.13843C12.9998 7.39382 14.3849 7.00035 15.7967 7V7.00711Z"
            stroke="#0C0D2D"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
