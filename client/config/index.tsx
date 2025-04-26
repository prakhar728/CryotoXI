
// config/index.tsx

import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { flareTestnet } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_ID;

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [flareTestnet]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [flareTestnet.id]: http("https://falling-skilled-uranium.flare-coston2.quiknode.pro/ext/bc/C/rpc"),
  },
})

export const config = wagmiAdapter.wagmiConfig