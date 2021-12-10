import React, { useEffect, useState } from "react";
import { utils } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { Split, Recipient } from "@/utils/OurzSubgraph";
import Table from "@/components/Charts/Table";
import { toTrimmedAddress } from "@/utils/index";
import Button from "@/components/Button";

const Sidebar = ({
  split,
  userInfo,
  clickClaim,
  isOwner,
  networkId,
}: {
  split: Split;
  userInfo: Recipient;
  clickClaim: () => Promise<void>;
  isOwner: boolean;
  networkId: number;
}): JSX.Element => {
  const [recipientInfo, setRecipientInfo] = useState<Recipient[] | undefined>();
  useEffect(() => {
    setRecipientInfo(split?.recipients);
  }, [split]);
  const Router = useRouter();

  return (
    <div className="flex h-full min-h-screen w-sidebar max-w-sidebar min-w-sidebar bg-dark-accent">
      <div className="mt-8 w-full">
        <div className="text-center text-dark-primary">
          <div id="info" className="flex flex-col mb-4 space-y-2">
            <h1 className="p-2 text-2xl tracking-widest font-hero text-dark-primary">
              {split.nickname}
            </h1>
            <h2 className="text-sm underline cursor-pointer text-dark-secondary">
              <a
                className="hover:underline hover:cursor"
                href={`https://etherscan.io/address/${split.id}`}
              >
                {toTrimmedAddress(split.id)}
              </a>
            </h2>
            <h4 className="mt-2 whitespace-pre-wrap text-dark-primary">
              {utils.formatEther(split.ETH.toString()) || 0} Ξ unclaimed in Split.
            </h4>
            {Number(userInfo?.claimableETH ? userInfo?.claimableETH.toString() : "0") > 0 && (
              <div className="mx-auto w-min">
                <Button
                  isMain={false}
                  text={`Claim ${utils.formatEther(userInfo.claimableETH.toString())}Ξ`}
                  onClick={() => clickClaim()}
                />
              </div>
            )}
            {/* {split?.role && `Your role: ${role as string}`} */}
          </div>
          <Table recipients={recipientInfo} />
          <div id="details">
            <div id="owners" className="my-2">
              <p className="font-bold">Owners:</p>
              {split?.owners.map((owner) => (
                <div className="cursor-pointer hover:underline" key={owner.id}>
                  <Link href={`/${networkId ?? 1}/profile/${owner.id}`} passHref>
                    {toTrimmedAddress(owner.id)}
                  </Link>
                </div>
              ))}
              <p className="mt-2 font-bold">Creator:</p>
              <div className="cursor-pointer hover:underline" key={split.creator.id}>
                <Link href={`/${networkId ?? 1}/profile/${split.creator.id}`} passHref>
                  {toTrimmedAddress(split.creator.id)}
                </Link>
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-4 items-baseline p-4 mx-auto my-4 w-min border border-dark-border">
              <Button
                isMain={false}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
