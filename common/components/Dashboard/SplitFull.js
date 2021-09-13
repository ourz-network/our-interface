import React, { useState } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import Button from "@/components/Button";
import ActionDialog from "@/components/Dashboard/ActionDialog";
import AuctionForm from "@/components/Dashboard/AuctionForm";
import { utils } from "ethers";
import DashboardNFT from "@/components/Cards/DashboardNFT";
import Table from "@/components/Charts/Table"
import { useAuctions } from "@zoralabs/nft-hooks";

const SplitFull = ({
  split,
  isOwned,
  showFull,
  setShowFull
}) => {
  const Router = useRouter();
  const { data, loading, error } = useAuctions(split.id);
  const [dialog, setDialog] = useState()
  const [showDialog, setShowDialog] = useState()
  const [selectedId, setSelectedId] = useState()
  console.log("auctions", data);

  let refDiv = useRef(null)

  const handleClickClose = () => {
    hide();
  };

  const startAnAuction = (tokenId) => {
    setSelectedId(tokenId);
    setDialog('auction');
    setShowDialog(true)
  };

  const hide = () => {
    setShowFull(false);
  };

  return (
   <>
      <div className="flex w-full min-h-screen mx-auto text-base text-left transition transform md:inline-block md:align-middle">
        <div className="flex flex-col w-full">
          <div ref={refDiv} className="relative flex items-center w-full h-full px-4 pb-8 shadow-2xl bg-dark-background pt-14 sm:px-6 sm:pt-8 md:p-6 lg:p-8">
            <button
              type="button"
              href="#"
              tabIndex="0"
              className="absolute text-dark-primary top-4 right-4 hover:text-dark-secondary sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
              onClick={() => setShowFull(false)}
            >
              <span className="text-ourange-400">Back</span>
            </button>
            {showDialog && dialog == 'auction' &&
              <ActionDialog
                showDialog={showDialog}
                setShowDialog={setShowDialog}
              >
                <AuctionForm 
                  tokenId={selectedId}
                  setShowDialog={setShowDialog}
                  split={split}
                  onClick={() => setShowDialog(false)}
                />
              </ActionDialog>
            }
            <div className="flex justify-around w-full">
              <div className="w-1/3">
                <Table recipients={split.splitRecipients} />
              </div>
                

              <div className="w-1/2 p-2 border h-min border-dark-border">
                <h1 className="text-xl font-bold tracking-widest text-dark-primary">
                  {split.nickname}
                </h1>
                <h2 className="text-sm font-extrabold text-dark-secondary sm:pr-12">
                  {split.id}
                </h2>
                <div className="flex items-baseline gap-4 mt-4">
                  <h4 className="text-lg font-medium whitespace-pre-wrap text-dark-primary">
                    {split.ETH ? utils.formatEther(split.ETH) : 0} ETH unclaimed in Split.
                  </h4>
                  {split.ETH > 0 &&
                    <Button
                      text="Claim"
                      onClick={''}
                    />
                  }
                </div>
                {isOwned &&
                  <div className="flex items-baseline gap-4 p-4 mx-auto mt-8 border border-dark-border w-min">
                    <Button 
                      text="Mint"
                      onClick={() => Router.push(`/create/mint/${split.id}`)}
                    />
                    {/* <Button 
                      text="Curate"
                      onClick={''}
                    />
                    <Button 
                      text="Crowdfund"
                      onClick={''}
                    />
                    <Button 
                      text="PartyBid"
                      onClick={''}
                    /> */}
                  </div>
                }
              </div>
            </div>
          </div>
          <p className="mt-4 text-2xl text-center text-dark-primary">
            {split?.creations ? split.creations?.length : 0 } NFT(s) minted
          </p>
          <h1 className="mx-auto mt-2 text-center text-dark-primary">If any NFTs are currently owned by the split, they will be shown below. <br /> Click to start an Auction</h1>
          <div className="flex w-full">
            {isOwned &&
              <>
                  {split?.creations?.length > 0 ? (
                    <div
                      id="medias"
                      className="flex flex-col gap-4 mx-4 justify-items-center content-evenly justify-evenly md:grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 max-w-auto"
                    >
                    {split.creations.map((creation, i) => {
                      return (
                        <div key={i} className="flex justify-center w-full h-full">
                          <DashboardNFT 
                            key={i}
                            tokenId={creation.tokenId}
                            onClick={() => startAnAuction(creation.tokenId)}
                            split={split}
                            isCreation={true}
                          />
                        </div>  
                      )
                    })}
                    </div> ) : (
                      ''
                    )
                  }
              </>
            }
            {data && 
              data.filter((auction) => 
              parseInt(auction.expectedEndTimestamp, 10) >= new Date().getTime() / 1000
            ).map((auction) => (
              <React.Fragment key={auction.id}>
                <DashboardNFT
                  key={auction.id}
                  tokenId={auction.tokenId}
                  onClick={(evt) =>
                    router.push(`/token/${auction.tokenContract}/${auction.tokenId}`)
                  }
                  split={split}
                  isCreation={false}
                />
              </React.Fragment>
            ))}
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default SplitFull;
