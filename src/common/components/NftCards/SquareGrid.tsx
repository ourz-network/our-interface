import React from "react";
import { NFTCard } from "@/modules/subgraphs/utils";
import NFTPreviewCard from "./Preview/NFTPreviewCard";

const SquareGrid = ({ posts }: { posts: NFTCard[] }) => (
  <div className="grid auto-rows-min gap-8 mx-8 3xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2">
    {posts.map((post, idx) => (
      <div
        key={post?.name ?? post?.tokenId ?? post?.editionAddress ?? idx}
        className="relative mx-auto h-full"
      >
        <NFTPreviewCard post={post} />
      </div>
    ))}
  </div>
);

export default SquareGrid;
