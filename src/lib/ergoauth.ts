export const AUTH_URL = 'https://crystalpool.cc:8443/auth'

let currentSessionId: string | null = null

export function getSessionId(): string | null {
  return currentSessionId
}

export function startAuthSession(): string {
  const id = crypto.getRandomValues(new Uint32Array(1))[0].toString()
  currentSessionId = id
  return id
}

export function clearAuthSession(): void {
  currentSessionId = null
}

export async function waitForWalletAuth(
  onAddressReceived: (address: string) => void,
  { timeout = 60_000, interval = 2_000 } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const started = Date.now()

    async function tick() {
      const id = currentSessionId
      if (!id) {
        reject(new Error('Auth session not started'))
        return
      }

      try {
        const res = await fetch(`${AUTH_URL}?id=${id}`)
        const text = await res.text()
        const data = JSON.parse(text)

        if (typeof data?.address === 'string' && data.address.length > 1) {
          onAddressReceived(data.address)
          resolve(data.address)
          return
        }
      } catch (err) {
        console.error('Auth poll failed:', err)
      }

      if (Date.now() - started >= timeout) {
        reject(new Error('Auth timed out (60 s)'))
        return
      }

      setTimeout(tick, interval)
    }

    tick()
  })
}
