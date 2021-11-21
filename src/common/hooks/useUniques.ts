import { useEffect, useState } from "react";
import { ethers, Signer } from "ethers";
import { Auction, AuctionHouse } from "@zoralabs/zdk";
import { createZoraAuction, placeBidZoraAH } from "@/modules/ethereum/OurPylon";
import { NFTCard } from "@/modules/subgraphs/utils";

const useUniques = ({
  post,
  signer,
  networkId,
}: {
  post: NFTCard;
  signer: Signer | undefined;
  networkId: number;
}) => {
  const [auctionInfo, setAuctionInfo] = useState<Auction | undefined>(undefined);
  const [bid, setBid] = useState(0);
  const [minBid, setMinBid] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function getAuctionInfo() {
      const auctionHouse = new AuctionHouse(signer, networkId);
      const auction = await auctionHouse.fetchAuction(post.auctionId);
      if (ethers.utils.formatEther(auction.amount.toString()) === "0.0") {
        setMinBid(Number(ethers.utils.formatEther(auction.reservePrice)));
        setBid(Number(ethers.utils.formatEther(auction.reservePrice)));
      } else {
        setMinBid(Number(ethers.utils.formatEther(auction.amount)) * 1.05);
        setBid(Number(ethers.utils.formatEther(auction.amount)) * 1.05);
      }
      setAuctionInfo(auction);
    }

    if (post.auctionId && signer) {
      getAuctionInfo().then(
        () => {},
        () => {}
      );
    }
  }, [networkId, post.auctionId, signer]);

  const placeBid = async () => {
    const success = await placeBidZoraAH({
      signer,
      auctionId: post.auctionId,
      bidAmount: bid,
      networkId,
    });
  };

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
      signer,
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
    auctionInfo,
    bid,
    setBid,
    minBid,
    placeBid,
  };
};

export default useUniques;
