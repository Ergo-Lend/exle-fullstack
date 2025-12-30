'use client'

import Image from 'next/image'

const partners = [
  { name: 'Spectrum Finance', logo: '/partners/spectrum-finance.svg', width: 157, height: 16 },
  { name: 'Sigmaverse', logo: '/partners/sigmaverse.svg', width: 118, height: 36 },
  { name: 'Ergopad', logo: '/partners/ergopad.svg', width: 118, height: 32 },
  { name: 'WEQNT', logo: '/partners/weqnt.svg', width: 76, height: 28 },
]

export function PartnersSection() {
  return (
    <section className="w-full py-16 md:py-24">
      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        EXLE Partners
      </h2>
      <p className="mb-12 text-center text-muted-foreground">
        Empowering Trust with a Flourish of Blockchain Partnerships
      </p>
      <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex items-center justify-center opacity-70 transition-opacity hover:opacity-100"
          >
            <Image
              src={partner.logo}
              alt={partner.name}
              width={partner.width}
              height={partner.height}
              className="h-auto"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
