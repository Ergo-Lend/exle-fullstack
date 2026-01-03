'use client'

const timelineEvents = [
  {
    year: '2024',
    quarter: 'Q2',
    title: 'Platform Redesign',
    text: 'Complete UI/UX overhaul with modern design, improved mobile experience, and enhanced user flows for creating and managing loans.',
  },
  {
    year: '2023',
    quarter: 'Q4',
    title: 'Crowdfund Loans Launch',
    text: 'Introduced crowdfunding capabilities allowing multiple lenders to collectively fund loan requests, expanding accessibility for borrowers.',
  },
  {
    year: '2023',
    quarter: 'Q1',
    title: 'Smart Contract V1.3',
    text: 'Major smart contract upgrade with improved security, gas optimization, and support for multiple token types including SigUSD stablecoin.',
  },
  {
    year: '2022',
    quarter: 'Q3',
    title: 'Mainnet Beta Launch',
    text: 'First public release on Ergo mainnet enabling real P2P lending transactions with Solofund single-lender loan support.',
  },
  {
    year: '2021',
    quarter: 'Q2',
    title: 'Project Inception',
    text: 'EXLE began as "Ergo-Lend" at ErgoHack 2 hackathon, laying the foundation for decentralized P2P lending on the Ergo blockchain.',
  },
]

export function RoadmapSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        Project Roadmap
      </h2>
      <p className="mx-auto mb-16 max-w-2xl text-center text-muted-foreground">
        EXLE started for the ErgoHack 2 hackathon as &apos;Ergo-Lend&apos; and we just kept going! We hope to help overcome some issues for the billions of unbanked people around the world. This is some of what we have in various stages of implementation.
      </p>

      <div className="mx-auto max-w-3xl">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex gap-8">
            {/* Year badge with connector */}
            <div className="relative flex flex-col items-center">
              {/* Year badge with left bracket border */}
              <div className="relative flex h-14 w-14 flex-col items-center justify-center rounded-lg border-l-2 border-muted-foreground/40 bg-transparent pl-1">
                <span className="text-xl font-bold leading-tight text-muted-foreground/80">
                  {event.year.slice(0, 2)}
                </span>
                <span className="text-xl font-bold leading-tight text-muted-foreground/80">
                  {event.year.slice(2)}
                </span>
              </div>

              {/* Dotted connector line */}
              {index < timelineEvents.length - 1 && (
                <div className="h-28 w-px border-l-2 border-dashed border-muted-foreground/30" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className="mb-2 text-lg font-bold">
                {event.title} <span className="font-normal text-muted-foreground/70">| {event.quarter}</span>
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {event.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
