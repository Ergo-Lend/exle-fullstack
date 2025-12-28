'use client'

const steps = [
  {
    number: '1',
    title: 'Create your loan request',
    description:
      'Fill out the loan form with relevant information and pay 0.1 ERG to create your loan.',
    gif: '/system-regular-50-file.gif',
  },
  {
    number: '2',
    title: 'Wait for your loan to get crowdfunded',
    description:
      'Our community members will fund your loan request as they see fit during the funding period.',
    gif: '/system-regular-67-clock.gif',
  },
  {
    number: '3',
    title: 'Withdraw your funded loan',
    description:
      'After your loan is fully funded, you can withdraw your funds and your repayment period begins.',
    gif: '/system-regular-5-wallet.gif',
  },
]

export function HowItWorksSteps() {
  return (
    <div className="flex w-full flex-wrap justify-center justify-between space-y-10 text-left max-md:flex-col max-md:items-center md:space-y-0">
      {steps.map((step) => (
        <div key={step.number} className="relative max-w-[290px] md:max-w-[240px]">
          <span className="absolute left-0 top-8 -z-10 text-[7rem] font-bold text-muted/50">
            {step.number}
          </span>
          <div
            className={`flex flex-col gap-2 ${
              step.number === '1' ? 'pl-6' : 'pl-9'
            }`}
          >
            <div className="flex items-center gap-4" style={{ marginLeft: '-3px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.gif} alt="" className="w-8 dark:invert" />
            </div>
            <h4 className="text-xl font-bold md:max-w-[190px] md:text-lg">
              {step.title}
            </h4>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
