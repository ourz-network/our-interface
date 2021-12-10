import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getQueryProvider } from "@/utils/index";

const queryProvider = getQueryProvider(1);

const useENS = ({ address }: { address: string }) => {
  // all user's splits
  const [addressOrENS, setAddressOrENS] = useState(
    `${address.substr(0, 4)}…${address.substr(address.length - 3, address.length)}`
  );

  useEffect(() => {
    async function getENS() {
      if (address) {
        const ENS = await queryProvider.lookupAddress(address);
        if (ENS) setAddressOrENS(`${ENS}`);
      }
    }

    getENS().then(
      () => {},
      () => {}
    );
  }, [address]);

  return {
    addressOrENS,
  };
};

export default useENS;
