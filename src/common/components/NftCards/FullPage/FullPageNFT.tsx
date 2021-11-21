import React from "react";
import { Signer } from "ethers";
import { FullComponents, NFTFullPage } from "@zoralabs/nft-components";
import { useRouter } from "next/router";
import DetailedPie, { ChartData } from "@/components/Charts/DetailedPie";
import { Recipient } from "@/utils/OurzSubgraph";
import ManageEdition from "./ManageEdition";
import { NFTCard } from "@/modules/subgraphs/utils";
import FullPageContext from "./FullPageContext";
import Details from "./Details";
import Cryptomedia from "./Cryptomedia";
import Links from "./Links";
import Royalties from "./Royalties";
import Table from "@/components/Charts/Table";
import ShareNFTE from "./ShareNFTE";
import useEditions from "@/common/hooks/useEditions";
import ManageUnique from "./ManageUnique";
import PlaceBid from "./PlaceBid";
import Button from "@/components/Button";
import web3 from "@/app/web3";

interface SaleInfo {
  maxSupply: number;
  currentSupply: number;
  salePrice: number;
}

const FullPageNFT = function ({
  post,
  saleInfo,
  recipients,
  chartData,
  signer,
  isOwner,
}: {
  post: NFTCard;
  saleInfo: SaleInfo;
  recipients: Recipient[];
  chartData: ChartData[] | null | undefined;
  signer: Signer | undefined;
  isOwner: boolean;
}): JSX.Element {
  const Router = useRouter();
  const { purchase } = useEditions({ post, signer, saleInfo });
  const { network } = web3.useContainer();
  return (
    <FullPageContext.Provider value={{ post, saleInfo }}>
      {post?.nftKind === "Edition" && (
        <div className="w-full h-full">
          <Cryptomedia />
          {post && (
            <div className="p-6 mx-auto mb-16 text-dark-primary max-w-11/12 xl:max-w-5/6">
              <div className="flex flex-col content-center mb-6 w-full lg:space-x-4 lg:flex-row">
                <div className="flex flex-col xl:w-7/12">
                  <Details purchase={purchase} />
                  <Links />
                  {isOwner && <ManageEdition />}
                </div>
                <div className="flex flex-col xl:mt-0 xl:w-5/12 xl:ml-6">
                  <Royalties />
                  {recipients?.length > 1 && <Table recipients={recipients} />}
                  {chartData?.length > 1 && (
                    <div className="h-96 border border-dark-border">
                      <div className="m-auto w-96 h-96">
                        <DetailedPie
                          chartData={chartData}
                          isSecondaryChart={Number(post.royalty) > 0}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {post?.nftKind === "1/1" && (
        <NFTFullPage id={post.tokenId as string}>
          {post.mimeType === "text/plain" ? (
            <div className="text-center">
              <FullComponents.MediaFull />
            </div>
          ) : (
            <Cryptomedia />
          )}
          <div className="p-6 mx-auto mb-6 max-w-11/12 xl:max-w-5/6">
            <div className="flex flex-col content-center mb-6 w-full lg:space-x-4 lg:flex-row">
              <div className="flex flex-col space-y-2 lg:w-7/12">
                <div className="flex flex-col justify-between mb-4 md:flex-row">
                  {post && <Details />}
                </div>
                <FullComponents.AuctionInfo />
                <div className="hidden flex-col my-auto md:flex">
                  <div className="flex place-self-end">
                    <p className="pr-2 my-auto">Bid on Zora Marketplace:</p>
                    <Button
                      text="Visit Zora"
                      onClick={() =>
                        Router.push(`https://zora.co/collections/zora/${post.tokenId}/auction/bid`)
                      }
                      isMain={false}
                    />
                  </div>
                </div>
                {network?.chainId === 1 && (
                  <div className="my-2">
                    <FullComponents.ProofAuthenticity />
                  </div>
                )}
              </div>
              <div className="flex flex-col space-y-2 xl:mt-0 xl:w-5/12 xl:ml-6">
                {isOwner && <ManageUnique />}
                <PlaceBid />
                <FullComponents.CreatorEquity />
                <FullComponents.BidHistory />
                {recipients?.length > 1 && <Table recipients={recipients} />}
                {chartData?.length > 1 && (
                  <div className="h-96 border border-dark-border">
                    <div className="m-auto w-96 h-96">
                      <DetailedPie chartData={chartData} isSecondaryChart={false} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isOwner && <ShareNFTE post={post} />}
          </div>
        </NFTFullPage>
      )}
    </FullPageContext.Provider>
  );
};

export default FullPageNFT;
