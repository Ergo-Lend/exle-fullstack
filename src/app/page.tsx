'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HowItWorksSteps } from '@/components/how-it-works-steps'
import { ErgoManifesto, ErgoManifestoMobile } from '@/components/ergo-manifesto'

export default function Home() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 xl:px-0">
      <section className="flex w-full flex-col items-center text-center space-y-6 md:space-y-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="absolute mt-4 w-[85%] max-w-[350px] md:hidden"
          src="/globe.png"
          alt=""
        />
        <div className="h-[180px] md:h-[50px]" />
        <h1 className="mt-24 bg-gradient-to-r from-exle-secondary to-exle-accent bg-clip-text py-1 text-4xl font-bold leading-[1.2] text-transparent md:py-2 md:text-5xl">
          Borrow and lend money<br className="hidden md:block" /> globally on Ergo chain
        </h1>

        <p className="mt-1 px-4 max-md:text-sm md:px-0 text-muted-foreground">
          A person-to-person (P2P) lending platform with easy-to-use<br className="hidden md:block" />
          tools to borrow and lend money on the Ergo blockchain.
        </p>
        <div className="flex w-full flex-col justify-center space-y-4 px-3 md:flex-row md:space-x-4 md:space-y-0 md:px-0">
          <Button asChild className="rounded-full bg-exle-accent hover:bg-exle-accent/90">
            <Link href="/loans/create">Create loan</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/learn-more">Learn more</Link>
          </Button>
        </div>

        <div className="relative" style={{ maxWidth: 522 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mt-4 hidden md:block" src="/globe.png" alt="" />
          <div className="block h-[100px] md:hidden" />
          <h2 className="absolute bottom-0 left-1/2 -translate-x-1/2 transform whitespace-nowrap text-3xl md:text-4xl font-semibold">
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
        <div className="my-20" />
      </section>
    </div>
  )
}
