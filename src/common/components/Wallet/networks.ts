// https://github.com/beefyfinance/beefy-app/blob/e744304e39b42ddf9579eadec0aff2bdc15e2b7a/src/common/networkSetup.js
// modified for ourz

interface INetwork {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: Array<string>;
  blockExplorerUrls: Array<string>;
}

/* eslint-disable import/first */
export const allNetworks = [
  {
    name: "AVALANCHE",
    asset: "AVALANCHE",
    id: 43114,
    hash: "/avax",
  },
  {
    name: "POLYGON",
    asset: "POLYGON",
    id: 137,
    hash: "/polygon",
  },
  {
    name: "FANTOM",
    asset: "FANTOM",
    id: 250,
    hash: "/fantom",
  },
  {
    name: "HARMONY",
    asset: "HARMONY",
    id: 1666600000,
    hash: "/harmony",
  },
  {
    name: "ARBITRUM",
    asset: "ARBITRUM",
    id: 42161,
    hash: "/arbitrum",
  },
];

const network = allNetworks.find((n) => window.location.hash.startsWith(`#${n.hash}`));

if (!network) {
  window.location.hash = allNetworks[0].hash;
  window.location.reload();
} else {
  window.REACT_APP_NETWORK_ID = network.id;
}

export default network;

export const networkSettings: Record<number, INetwork> = {
  43114: {
    chainId: `0x${parseInt("43114", 10).toString(16)}`,
    chainName: "Avalanche C-Chain",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"],
  },
  137: {
    chainId: `0x${parseInt("137", 10).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  250: {
    chainId: `0x${parseInt("250", 10).toString(16)}`,
    chainName: "Fantom Opera",
    nativeCurrency: {
      name: "FTM",
      symbol: "FTM",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.ftm.tools"],
    blockExplorerUrls: ["https://ftmscan.com/"],
  },
  1666600000: {
    chainId: `0x${parseInt("1666600000", 10).toString(16)}`,
    chainName: "Harmony One",
    nativeCurrency: {
      name: "ONE",
      symbol: "ONE",
      decimals: 18,
    },
    rpcUrls: ["https://api.s0.t.hmny.io/"],
    blockExplorerUrls: ["https://explorer.harmony.one/"],
  },
  42161: {
    chainId: `0x${parseInt("42161", 10).toString(16)}`,
    chainName: "Arbitrum One",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io/"],
  },
};

export const networkSetup = (chainId: number): Promise<any> =>
  new Promise((resolve, reject) => {
    const provider = window.ethereum;
    if (provider) {
      // eslint-disable-next-line no-prototype-builtins
      if (networkSettings.hasOwnProperty(chainId)) {
        provider
          .request({
            method: "wallet_addEthereumChain",
            params: [networkSettings[chainId]],
          })
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`No network settings configured for chainId: '${chainId}'`));
      }
    } else {
      reject(new Error(`window.ethereum is '${typeof provider}'`));
    }
  });

export const getRpcUrl = () => {
  const settings = networkSettings[window.REACT_APP_NETWORK_ID];
  // eslint-disable-next-line no-bitwise
  return settings.rpcUrls[~~(settings.rpcUrls.length * Math.random())];
};
