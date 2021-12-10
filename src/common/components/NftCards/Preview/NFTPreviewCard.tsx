/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable consistent-return */
import Link from "next/link"; // Dynamic routing
import Image from "next/image"; // Dynamic routing
import React, { useEffect, useState } from "react"; // React state management
import { ethers } from "ethers";
import { NFTPreview, PreviewComponents } from "@zoralabs/nft-components";
import { useRouter } from "next/router";
import editionJSON from "@/ethereum/abis/SingleEditionMintable.json";
import { NFTCard } from "@/modules/subgraphs/utils";
import { getQueryProvider, toTrimmedAddress } from "@/utils/index";

const NFTPreviewCard = ({ post }: { post: NFTCard }): JSX.Element => {
  const [supply, setSupply] = useState<number | undefined>(undefined);
  const router = useRouter();
  const networkId = Number(router.query.networkId);

  const MediaThumb = () => (
    <Link
      href={
        post?.editionAddress
          ? `/${networkId ?? 1}/nft/edition/${post.editionAddress}`
          : `/${networkId ?? 1}/nft/${post?.tokenId as string}`
      }
      passHref
    >
      <div className="relative bg-opacity-0 cursor-pointer h-preview w-preview max-w-preview">
        {post.mimeType.startsWith("video") && (
          <video muted autoPlay={false} controls playsInline>
            <source src={post.contentURI} />
          </video>
        )}
        {post.mimeType.startsWith("image") && (
          <Image
            alt={`An image of the NFT: ${post.name}`}
            layout="fill"
            objectFit="cover"
            src={post.contentURI}
          />
        )}
      </div>
    </Link>
  );

  const Title = () => (
    <div className="flex flex-col p-1 space-y-1.5 border-t bg-dark-accent border-dark-border">
      <div className="mx-auto text-base tracking-wider font-base text-dark-primary">
        {!post.name ? `Untitled` : post.name}
      </div>
      {supply !== undefined ? (
        <div className="mx-auto text-xs font-light text-dark-primary">
          {supply}/{post.editionSize} Minted
        </div>
      ) : (
        <div className="self-end text-xs italic text-dark-primary">
          by:{` `}
          <Link href={`/${networkId ?? 1}/profile/${post.creator}`}>
            {toTrimmedAddress(post.creator)}
          </Link>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    async function getEditionSupply(): Promise<void> {
      const queryProvider = getQueryProvider(networkId);
      const editionContract = new ethers.Contract(
        post?.editionAddress as string,
        editionJSON.abi,
        queryProvider
      );
      const totalSupply = await editionContract.totalSupply();
      setSupply(Number(totalSupply.toString()));
    }
    if (post?.editionAddress) {
      getEditionSupply().then(
        () => {},
        () => {}
      );
    }
  }, [post]);

  if (!post) return <></>;
  return (
    <>
      {post.nftKind === "Edition" && (
        <div className="m-auto max-w-preview">
          <div className="flex flex-col p-0 m-0 border border-dark-border">
            <MediaThumb />
            <Title />
          </div>
        </div>
      )}
      {post.nftKind === "1/1" && (
        <div className="w-full">
          <NFTPreview id={post.tokenId}>
            <MediaThumb />
            <Title />
            <PreviewComponents.PricingComponent />
          </NFTPreview>
        </div>
      )}
    </>
  );
};

export default NFTPreviewCard;
