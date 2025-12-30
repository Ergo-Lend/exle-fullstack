'use client'

const timelineEvents = [
  {
    year: '2024',
    quarter: 'Q2',
    title: 'Roadmap Title',
    text: 'EXLE started for the ErgoHack 2 hackathon as \'Ergo-Lend\' and we just kept going! We hope to help overcome some issues for the billions of',
  },
  {
    year: '2023',
    quarter: 'Q4',
    title: 'Roadmap Title',
    text: 'EXLE started for the ErgoHack 2 hackathon as \'Ergo-Lend\' and we just kept going! We hope to help overcome some issues for the billions of',
  },
  {
    year: '2023',
    quarter: 'Q1',
    title: 'Roadmap Title',
    text: 'EXLE started for the ErgoHack 2 hackathon as \'Ergo-Lend\' and we just kept going! We hope to help overcome some issues for the billions of',
  },
  {
    year: '2022',
    quarter: 'Q3',
    title: 'Roadmap Title',
    text: 'EXLE started for the ErgoHack 2 hackathon as \'Ergo-Lend\' and we just kept going! We hope to help overcome some issues for the billions of',
  },
  {
    year: '2021',
    quarter: 'Q2',
    title: 'Roadmap Title',
    text: 'EXLE started for the ErgoHack 2 hackathon as \'Ergo-Lend\' and we just kept going! We hope to help overcome some issues for the billions of',
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
