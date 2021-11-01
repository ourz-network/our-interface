/* eslint-disable no-console */
import React, { useContext } from "react";
import web3 from "@/app/web3";
import FullPageContext from "./FullPageContext";
import useUniques from "@/common/hooks/useUniques";
import Button from "@/components/Button";

const ManageUnique = () => {
  const { post } = useContext(FullPageContext);
  const { signer } = web3.useContainer();
  const { formData, startAuction, handleChange } = useUniques({ post, signer });

  return (
    <div className="hidden justify-center p-4 space-y-2 border-2 md:flex md:flex-col border-dark-ourange">
      <p className="mx-auto mb-2 text-xl">Manage Your ZNFT</p>
      <div className="flex space-x-2">
        <div className="flex flex-col place-content-evenly py-4 mx-auto space-y-2 w-3/5 text-center border border-dark-border">
          <p className="font-semibold">Start Auction</p>
          <p className="text-xs italic text-center">in ETH</p>
          {/* <AuctionForm tokenId={post.tokenId} split={split} /> */}
          <label className="flex flex-col mx-auto mt-4 text-dark-primary" htmlFor="reservePrice">
            Reserve Price in ETH
            <div className="flex visible justify-center mb-2">
              <input
                className="visible w-24 outline-none bg-dark-background focus:outline-none focus:border-dark-secondary focus:ring-transparent"
                type="number"
                id="reservePrice"
                name="reservePrice"
                value={formData.reservePrice}
                onChange={(e) => handleChange(e)}
              />
              <span className="inline-flex items-center px-3 text-sm border border-l-0 text-dark-primary border-dark-border md bg-dark-background">
                Ξ
              </span>
            </div>
          </label>
          <label className="flex flex-col mx-auto text-dark-primary" htmlFor="duration">
            Length of Auction in Hours
            <div className="flex justify-center mb-2">
              <input
                className="visible w-24 outline-none bg-dark-background focus:outline-none focus:border-dark-secondary focus:ring-transparent"
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={(e) => handleChange(e)}
              />
              <span className="inline-flex items-center px-3 text-sm border border-l-0 text-dark-primary border-dark-border md bg-dark-background">
                Hours
              </span>
            </div>
          </label>
          <div className="mx-auto">
            <Button text="Start Auction" isMain={false} onClick={() => startAuction()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUnique;
