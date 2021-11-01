import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useRouter } from "next/router";
import web3 from "@/app/web3";
import ActionDialog from "@/components/Dashboard/ActionDialog";
import AuctionForm from "@/components/Dashboard/AuctionForm";
import { Split, Recipient } from "@/utils/OurzSubgraph";
import Sidebar from "./Sidebar";
import { NFTCard } from "@/modules/subgraphs/utils";
import SquareGrid from "@/common/components/NFTs/SquareGrid";

const SplitFull = ({
  split,
  isOwner,
  userInfo,
  setShowFull,
  creations,
  editions,
  clickClaim,
}: {
  split: Split;
  isOwner: boolean;
  userInfo: Recipient;
  setShowFull: Dispatch<SetStateAction<boolean>>;
  creations: NFTCard[];
  editions: NFTCard[];
  clickClaim: () => Promise<void>;
}): JSX.Element => {
  const Router = useRouter();
  const { signer, address } = web3.useContainer();
  const [dialog, setDialog] = useState<string | undefined>();
  const [showDialog, setShowDialog] = useState<boolean | undefined>();
  const [selectedId, setSelectedId] = useState<number | undefined>();

  const refDiv = useRef(null);

  // const startAnAuction = (tokenId) => {
  //   setSelectedId(tokenId);
  //   setDialog("auction");
  //   setShowDialog(true);
  // };

  return (
    <div className="flex overflow-hidden w-full">
      <div className="hidden lg:inline-block">
        <Sidebar split={split} userInfo={userInfo} clickClaim={clickClaim} isOwner={isOwner} />
      </div>
      <div className="flex w-full min-h-screen text-base">
        <div className="flex flex-col w-full">
          <div
            ref={refDiv}
            className="flex items-center px-4 pb-4 w-full shadow-2xl bg-dark-background sm:px-6 md:px-6 lg:px-8"
          >
            <button
              type="button"
              tabIndex={0}
              className="absolute right-4 top-16 text-dark-primary hover:text-dark-secondary md:top-24 md:right-6 lg:top-24 lg:right-8"
              onClick={() => setShowFull(false)}
            >
              <span className="p-2 border text-ourange-400 border-dark-border">Go Back</span>
            </button>
            {showDialog && dialog === "auction" && (
              <ActionDialog showDialog={showDialog} setShowDialog={setShowDialog}>
                <AuctionForm
                  tokenId={selectedId}
                  split={split}
                  onClick={() => setShowDialog(false)}
                />
              </ActionDialog>
            )}
          </div>
          {editions?.length > 0 ? (
            <>
              <h1 className="mx-auto my-2 text-4xl italic text-center font-hero text-dark-primary">
                Editions
              </h1>
              <SquareGrid posts={editions} />
            </>
          ) : (
            <h1 className="mx-auto my-2 text-4xl italic text-center font-hero text-dark-primary">
              No Editions
            </h1>
          )}
          {creations?.length > 0 ? (
            <>
              <h1 className="mx-auto my-2 text-4xl italic text-center font-hero text-dark-primary">
                1/1 Creations
              </h1>
              <SquareGrid posts={creations} />
            </>
          ) : (
            <h1 className="mx-auto my-2 text-4xl italic text-center font-hero text-dark-primary">
              No Creations
            </h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplitFull;
