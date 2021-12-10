import React from "react";
import makeBlockie from "ethereum-blockies-base64"; // Ethereum avatar
import Image from "next/image";
import { toTrimmedAddress } from "@/utils/index";

const ProfileHeader = ({ linkAddress }: { linkAddress: string }): JSX.Element => {
  const Blockie = () => (
    <>
      <div className="block mx-auto w-20 h-20 rounded-full border border-dark-accent">
        <a href={`https://etherscan.io/address/${linkAddress}`}>
          <Image
            src={makeBlockie(linkAddress)}
            alt="Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
        </a>
      </div>
      <p className="text-xs text-dark-primary">
        <a
          href={`https://etherscan.io/address/${linkAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline cursor-poiner"
        >
          {`${toTrimmedAddress(linkAddress)}`}
        </a>
      </p>
    </>
  );

  return (
    <>
      <div className="flex flex-col justify-center w-full bg-dark-background">
        <div className="flex flex-col justify-center p-4 space-y-4 text-xs text-center border-b border-dark-border">
          <Blockie />
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
