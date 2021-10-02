/* eslint-disable no-nested-ternary */
import { Web3Provider } from "@ethersproject/providers";
import ms from "ms.macro";

import { SupportedChainId } from "./chains";

const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {
  // [SupportedChainId.ARBITRUM_ONE]: ms`1s`,
  // [SupportedChainId.ARBITRUM_RINKEBY]: ms`1s`,
  // [SupportedChainId.OPTIMISM]: ms`1s`,
  // [SupportedChainId.OPTIMISTIC_KOVAN]: ms`1s`,
};

export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === "number"
      ? provider.chainId
      : typeof provider.chainId === "string"
      ? // eslint-disable-next-line radix
        parseInt(provider.chainId)
      : "any"
  );
  library.pollingInterval = 15_000;
  library.detectNetwork().then(
    (network) => {
      const networkPollingInterval = NETWORK_POLLING_INTERVALS[network.chainId];
      if (networkPollingInterval) {
        // eslint-disable-next-line no-console
        console.debug("Setting polling interval", networkPollingInterval);
        library.pollingInterval = networkPollingInterval;
      }
    },
    () => {}
  );
  return library;
}
