/* eslint-disable no-console */
import { useState } from "react";
import { Signer } from "ethers";
import { createZoraAuction } from "@/modules/ethereum/OurPylon";
import { NFTCard } from "@/modules/subgraphs/utils";

interface SaleInfo {
  maxSupply: number;
  currentSupply: number;
  salePrice: number;
}

const useUniques = ({ post, signer }: { post: NFTCard; signer: Signer | undefined }) => {
  const [formData, setFormData] = useState({
    signer,
    proxyAddress: post?.creator,
    tokenId: post?.tokenId,
    tokenContract: `${process.env.NEXT_PUBLIC_ZMEDIA_1}`,
    duration: 24,
    reservePrice: 1,
    curator: post?.creator,
    curatorFeePercentage: 0,
    auctionCurrency: "0x0000000000000000000000000000000000000000",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const startAuction = async () => {
    const success = await createZoraAuction({
      ...formData,
    });

    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESS`);
  };

  return {
    formData,
    handleChange,
    startAuction,
  };
};

export default useUniques;
