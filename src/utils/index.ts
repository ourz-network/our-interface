import { ethers } from "ethers";

export const addressLength = 42;

export const zeroAddress = "0x0000000000000000000000000000000000000000";

const API_KEYS = {
  infura: process.env.NEXT_PUBLIC_INFURA_ID,
  alchemy: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  pocket: process.env.NEXT_PUBLIC_POKT_ID,
  etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_KEY,
};

const matic: Network = {
  name: "matic",
  chainId: 137,
  _defaultProvider: (providers) =>
    new providers.JsonRpcProvider(
      `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
};

export const getQueryProvider = (networkId) => {
  switch (networkId) {
    case 1:
      return ethers.providers.getDefaultProvider("homestead", API_KEYS);

    case 137:
      return ethers.providers.getDefaultProvider(matic);

    default:
      return ethers.providers.getDefaultProvider("homestead", API_KEYS);
  }
};

/* NFTE @contextart/nfte */

export function toTrimmedAddress(value: string): string {
  if (!value) return "";
  return `${value.substr(0, 6)}…${value.substr(value.length - 4, value.length)}`;
}

export function isAddress(value: string): boolean {
  return value?.startsWith("0x") && value?.length === addressLength;
}

export function cx(classNames: unknown[]): string {
  return classNames.filter(Boolean).join(" ");
}

export function tsFormat(value: string): string {
  const dateObj = new Date(parseInt(value, 10) * 1000);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const date = dateObj.getUTCDate();
  const hour = dateObj.getUTCHours();
  const mins = dateObj.getUTCMinutes();
  return `${String(date).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} ${String(
    hour
  ).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/* NFTE @contextart/nfte */

export function keyDownA11y(handler: () => void): (event: React.KeyboardEvent) => void {
  return function onKeyDown(event: React.KeyboardEvent) {
    if (["keydown", "keypress"].includes(event.type) && ["Enter", " "].includes(event.key)) {
      handler();
    }
  };
}
