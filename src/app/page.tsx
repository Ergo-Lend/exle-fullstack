'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { ErgoManifesto, ErgoManifestoMobile } from '@/components/ergo-manifesto'
import { FeaturesSection } from '@/components/features-section'
import { CommunitySection } from '@/components/community-section'
import { PartnersSection } from '@/components/partners-section'
import { RoadmapSection } from '@/components/roadmap-section'

export default function Home() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
      <section className="flex w-full flex-col items-center text-center md:space-y-8">
        {/* Mobile globe - larger with text overlapping */}
        <div className="relative w-full pt-6 md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto w-[280px]"
            src="/globe-2@2x.png"
            alt=""
          />
        </div>

        <h1 className="-mt-16 md:mt-0 relative z-10 bg-gradient-to-r from-exle-secondary to-exle-accent bg-clip-text py-1 text-3xl font-bold leading-[1.2] text-transparent md:py-2 md:text-5xl">
          Borrow and lend money<br className="hidden md:block" /> globally on Ergo chain
        </h1>

        <p className="px-4 py-4 md:py-2 text-sm md:text-base md:px-0 text-muted-foreground">
          A person-to-person (P2P) lending platform with easy-to-use<br className="hidden md:block" />
          tools to borrow and lend money on the Ergo blockchain.
        </p>

        <div className="flex w-full flex-col justify-center gap-3 px-4 md:flex-row md:gap-4 md:px-0">
          <Button asChild className="rounded-full bg-exle-accent hover:bg-exle-accent/90">
            <Link href="/loans/create">Create loan</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/learn-more">Learn more</Link>
          </Button>
        </div>

        <div className="relative w-full" style={{ maxWidth: 522 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mt-4 hidden md:block mx-auto" src="/globe-2@2x.png" alt="" />
          <div className="block h-[40px] md:hidden" />
          <h2 className="md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:transform whitespace-nowrap text-2xl md:text-4xl font-semibold">
            How does it work?
          </h2>
        </div>
      </section>

      <section className="flex w-full flex-col items-center text-center">
        <div className="mt-10 md:mt-20" />
        <HowItWorksSteps />
        <div className="my-20" />
        <div className="hidden md:block w-full max-w-4xl">
          <ErgoManifesto />
        </div>
        <div className="block md:hidden w-full">
          <ErgoManifestoMobile />
        </div>
      </section>

      <FeaturesSection />
      <CommunitySection />
      <PartnersSection />
      <RoadmapSection />

      <div className="my-20" />
    </div>
  )
}
