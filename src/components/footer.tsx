'use client'

import Link from 'next/link'
import { ExleLogo } from './exle-logo'

const links = [
  { name: 'Loans', href: '/loans' },
  { name: 'Repayments', href: '/repayments' },
  { name: 'Docs', href: '/docs' },
]

// Social media icons
function TwitterIcon() {
  return (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:invert"
    >
      <g clipPath="url(#clip0_twitter)">
        <path
          d="M14.368 5.166C14.368 5.02133 14.3627 4.88067 14.356 4.742C15.0067 4.28 15.554 3.70333 16 3.03933V3.03867C15.4047 3.29933 14.7713 3.47267 14.11 3.55667C14.79 3.15067 15.3093 2.51267 15.5533 1.744C14.9193 2.122 14.2193 2.38867 13.4733 2.538C12.8713 1.89667 12.0133 1.5 11.0773 1.5C9.26133 1.5 7.79933 2.974 7.79933 4.78067C7.79933 5.04067 7.82133 5.29067 7.87533 5.52867C5.14867 5.39533 2.73533 4.08867 1.114 2.09733C0.831333 2.58867 0.664667 3.15067 0.664667 3.75533C0.664667 4.89133 1.24933 5.898 2.122 6.48133C1.59467 6.47133 1.078 6.318 0.64 6.07733V6.11333C0.64 7.70733 1.77667 9.03133 3.268 9.33667C2.76667 9.474 2.14933 9.46867 1.78733 9.38867C2.212 10.6873 3.41867 11.6427 4.852 11.674C3.736 12.5467 2.31867 13.0727 0.784667 13.0727C0.516 13.0727 0.258 13.0607 0 13.028C1.45333 13.9647 3.17467 14.5 5.032 14.5C11.068 14.5 14.368 9.5 14.368 5.166Z"
          fill="#0C0D2D"
        />
      </g>
      <defs>
        <clipPath id="clip0_twitter">
          <rect width="1.5em" height="1.5em" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function DiscordIcon() {
  return (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:invert"
    >
      <path
        d="M13.5447 1.91318C12.5249 1.44527 11.4314 1.10052 10.288 0.90305C10.2671 0.899238 10.2463 0.908769 10.2356 0.9278C10.095 1.17796 9.93918 1.50427 9.83009 1.76077C8.60031 1.57664 7.37681 1.57664 6.17224 1.76077C6.06312 1.49858 5.90168 1.17796 5.7604 0.9278C5.74968 0.909394 5.72887 0.899863 5.70806 0.90305C4.56531 1.09986 3.47174 1.44461 2.45131 1.91318C2.44246 1.91699 2.4349 1.92333 2.42987 1.93158C0.355617 5.03049 -0.212633 8.05324 0.0661173 11.0385C0.0673673 11.0531 0.0755861 11.067 0.0869298 11.076C1.45546 12.081 2.78115 12.6911 4.08218 13.0956C4.10299 13.1019 4.12506 13.0943 4.13831 13.0771C4.44606 12.6569 4.7204 12.2137 4.95562 11.7477C4.96949 11.7204 4.95624 11.688 4.92787 11.6772C4.49271 11.5121 4.07837 11.3109 3.67977 11.0823C3.64824 11.0639 3.64571 11.0188 3.67474 10.9972C3.75862 10.9344 3.84252 10.869 3.92262 10.803C3.93712 10.7909 3.95731 10.7884 3.97434 10.796C6.59284 11.9915 9.42768 11.9915 12.0153 10.796C12.0323 10.7877 12.0525 10.7903 12.0676 10.8023C12.1477 10.8683 12.2316 10.9344 12.3161 10.9972C12.3451 11.0188 12.3432 11.0639 12.3117 11.0823C11.9131 11.3153 11.4988 11.5121 11.063 11.6765C11.0346 11.6873 11.022 11.7204 11.0359 11.7476C11.2762 12.213 11.5505 12.6562 11.8526 13.0765C11.8652 13.0943 11.8879 13.1019 11.9087 13.0955C13.2161 12.6911 14.5417 12.081 15.9103 11.0759C15.9223 11.067 15.9298 11.0537 15.9311 11.0391C16.2647 7.58783 15.3723 4.58986 13.5655 1.93221C13.5611 1.92333 13.5535 1.91699 13.5447 1.91318ZM5.34671 9.22077C4.55837 9.22077 3.90877 8.49702 3.90877 7.60814C3.90877 6.7193 4.54574 5.99552 5.34671 5.99552C6.15393 5.99552 6.79724 6.72564 6.78462 7.60814C6.78462 8.49702 6.14762 9.22077 5.34671 9.22077ZM10.6632 9.22077C9.87487 9.22077 9.22528 8.49702 9.22528 7.60814C9.22528 6.7193 9.86224 5.99552 10.6632 5.99552C11.4704 5.99552 12.1137 6.72564 12.1011 7.60814C12.1011 8.49702 11.4705 9.22077 10.6632 9.22077Z"
        fill="#0C0D2D"
      />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg
      width="1.5em"
      height="1.5em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="dark:invert"
    >
      <g clipPath="url(#clip0_telegram)">
        <path
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
          fill="#0C0D2D"
        />
        <path
          d="M3.66084 7.82668L11.3742 4.85268C11.7322 4.72335 12.0448 4.94002 11.9288 5.48135L11.9295 5.48068L10.6162 11.668C10.5188 12.1067 10.2582 12.2134 9.89351 12.0067L7.89351 10.5327L6.92884 11.462C6.82217 11.5687 6.73218 11.6587 6.52551 11.6587L6.66751 9.62335L10.3742 6.27468C10.5355 6.13268 10.3382 6.05268 10.1255 6.19402L5.54484 9.07802L3.57017 8.46202C3.14151 8.32602 3.13218 8.03335 3.66084 7.82668Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_telegram">
          <rect width="1.5em" height="1.5em" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 w-full text-sm font-light max-xl:px-8">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between py-6 border-t border-border">
        {/* Logo and Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center gap-1 font-semibold">
            <ExleLogo />
            EXLE
          </Link>
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-exle-secondary max-md:hidden"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex items-center space-x-6 max-md:text-lg md:space-x-4">
          <a href="#" className="hover:text-exle-secondary">
            <TwitterIcon />
          </a>
          <a href="#" className="hover:text-exle-secondary">
            <DiscordIcon />
          </a>
          <a href="#" className="hover:text-exle-secondary">
            <TelegramIcon />
          </a>
        </div>
      </div>

      {/* Mobile Links */}
      <div className="mb-10 flex flex-col gap-4 text-md font-light md:hidden">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="hover:text-exle-secondary"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </footer>
  )
}
