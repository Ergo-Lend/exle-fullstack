'use client'

// Custom icons matching Figma design
function GlobeNetworkIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main globe circle */}
      <circle cx="32" cy="32" r="18" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      {/* Horizontal arc */}
      <ellipse cx="32" cy="32" rx="18" ry="7" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      {/* Vertical arc */}
      <ellipse cx="32" cy="32" rx="7" ry="18" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      {/* Network nodes */}
      <circle cx="20" cy="20" r="3.5" fill="#6B7280" />
      <circle cx="48" cy="24" r="3" fill="#6B7280" />
      <circle cx="32" cy="52" r="3" fill="#6B7280" />
      <circle cx="16" cy="38" r="2.5" fill="#9CA3AF" />
      <circle cx="50" cy="40" r="2" fill="#9CA3AF" />
      {/* Connection lines */}
      <line x1="22" y1="22" x2="30" y2="30" stroke="#6B7280" strokeWidth="1" />
      <line x1="46" y1="25" x2="34" y2="30" stroke="#6B7280" strokeWidth="1" />
      <line x1="32" y1="50" x2="32" y2="36" stroke="#6B7280" strokeWidth="1" />
    </svg>
  )
}

function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="48"
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left user (gray) */}
      <circle cx="12" cy="20" r="8" fill="#6B7280" />
      {/* Center user (blue - main) */}
      <circle cx="32" cy="16" r="10" fill="#4E54E6" />
      {/* Right user (gray) */}
      <circle cx="52" cy="20" r="8" fill="#6B7280" />
    </svg>
  )
}

function SmartContractIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Magnifying glass circle (filled dark) */}
      <circle cx="26" cy="26" r="20" fill="#374151" />
      {/* Code brackets < > */}
      <path d="M22 20L14 26L22 32" stroke="#4E54E6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 20L38 26L30 32" stroke="#4E54E6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Magnifying glass handle */}
      <line x1="42" y1="42" x2="56" y2="56" stroke="#4E54E6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

function FlexibleFinanceIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded rectangle background */}
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#374151" />
      {/* Top left - square outline */}
      <rect x="14" y="14" width="14" height="14" rx="2" stroke="#4E54E6" strokeWidth="2" fill="none" />
      {/* Top right - two dots */}
      <circle cx="40" cy="18" r="3" fill="#4E54E6" />
      <circle cx="50" cy="18" r="3" fill="#4E54E6" opacity="0.5" />
      {/* Bottom left - line */}
      <rect x="14" y="42" width="14" height="4" rx="2" fill="#4E54E6" opacity="0.7" />
      {/* Bottom right - two dots */}
      <circle cx="40" cy="44" r="3" fill="#4E54E6" opacity="0.5" />
      <circle cx="50" cy="44" r="3" fill="#4E54E6" opacity="0.5" />
    </svg>
  )
}

const features = [
  {
    Icon: GlobeNetworkIcon,
    title: 'Global Availability',
    description:
      'Seamless global lending on Ergo blockchain. EXLE enables borderless financial opportunities, fostering inclusivity for users worldwide.',
    accentDot: 'top-right' as const,
  },
  {
    Icon: CommunityIcon,
    title: 'Trust & Community Support',
    description:
      'Community-powered trust. EXLE operates on a charity-style model, connecting users globally through voluntary support without the need for collateral.',
    accentDot: null,
  },
  {
    Icon: SmartContractIcon,
    title: 'Transparent Smart Contracts',
    description:
      "Secure, automated agreements. EXLE's transparent smart contracts on Ergo blockchain ensure trust and security, automating and enforcing loan terms seamlessly.",
    accentDot: 'bottom-left' as const,
  },
  {
    Icon: FlexibleFinanceIcon,
    title: 'Flexible & Inclusive Financing',
    description:
      'Tailored financial empowerment. EXLE offers customizable loan requests, allowing users to set their terms for repayment, interest rates, and financial flexibility.',
    accentDot: null,
  },
]

export function FeaturesSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
        What distinguishes EXLE?
      </h2>
      <div className="grid grid-cols-1 gap-x-24 gap-y-16 md:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.title} className="relative">
            {/* Icon */}
            <div className="relative mb-6 inline-block">
              <feature.Icon className="h-16 w-16" />
              {/* Decorative accent dots */}
              {feature.accentDot === 'top-right' && (
                <div className="absolute -right-1 top-0 h-3 w-3 rounded-full bg-exle-accent" />
              )}
              {feature.accentDot === 'bottom-left' && (
                <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-exle-accent" />
              )}
            </div>

            {/* Content */}
            <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
