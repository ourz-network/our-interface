import { useContext } from "react";
import { ethers } from "ethers";
import web3 from "@/app/web3";
import useUniques from "@/hooks/useUniques";
import FullPageContext from "./FullPageContext";
import Button from "@/components/Button";

const PlaceBid = () => {
  const { post } = useContext(FullPageContext);
  const { signer } = web3.useContainer();
  const { auctionInfo, bid, setBid, placeBid, minBid } = useUniques({ post, signer });

  return (
    <>
      {auctionInfo?.approved && signer && (
        <div className="flex flex-col p-2 mt-2 space-y-2 w-full text-center border border-dark-ourange">
          <p className="text-center text-dark-primary">Minimum Bid:{` ${minBid}Ξ`}</p>
          <div className="flex mx-auto">
            <input
              className="visible mx-auto w-24 outline-none bg-dark-background focus:outline-none focus:border-dark-secondary focus:ring-transparent"
              type="number"
              id="price"
              name="price"
              value={bid}
              min={minBid?.toString()}
              placeholder={`${minBid}`}
              onChange={(e) => setBid(e.target.value)}
              aria-label="price"
            />
            <span className="inline-flex items-center px-3 text-sm border border-l-0 text-dark-primary border-dark-border md bg-dark-background">
              Ξ
            </span>
          </div>
          <div className="mx-auto">
            <Button onClick={() => placeBid()} text={`Place bid for ${bid}Ξ`} isMain={false} />
          </div>
        </div>
      )}
    </>
  );
};

export default PlaceBid;
