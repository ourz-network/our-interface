import React from "react";
import { NFTE } from "@nfte/react";
import { NFTCard } from "@/modules/subgraphs/utils";

const ShareNFTE = ({ post }: { post: NFTCard }): JSX.Element => {
  const jsCodeSnippet = `<div className='nft-embed'></div>
<script
  async src='https://nfte.app/api/embed.js?contract=0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7&tokenId=${post?.tokenId}'>
</script>`; // mainnet REPLACE
  const reactCodeSnippet = `import { NFTE } from '@nfte/react';
import Link from 'next/link';
        
<NFTE contract="0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7" tokenId="${post.tokenId}"/>`;

  return (
    <div className="hidden p-4 mx-auto my-2 w-full h-auto border min-w-nfte border-dark-border md:flex-col md:flex">
      <h1 className="mx-auto mb-2 text-xl text-center">Share</h1>
      <h1 className="mx-auto mb-4 text-sm italic text-center">
        Display on your own website thanks to NFTE!
      </h1>
      <div className="flex flex-col justify-center mt-2 w-full">
        <div className="flex flex-col justify-center">
          <div className="mx-auto">
            <h2 className="font-bold">HTML/JS snippet</h2>
            <h4>Copy/paste into your site:</h4>
            <div className="overflow-visible p-1 mt-1 mb-4 h-auto font-mono text-sm whitespace-pre-wrap break-all border border-solid resize-none text-ourange-300 border-dark-border bg-code-snippet">
              {jsCodeSnippet}
            </div>
          </div>
          <div className="mx-auto">
            <h2 className="font-bold">React</h2>
            <h4>Install with npm i @nfte/react or yarn add @nfte/react</h4>
            <div className="overflow-visible p-1 mt-1 mb-2 h-auto font-mono text-sm whitespace-pre-wrap break-all border border-solid resize-none text-ourange-300 border-dark-border bg-code-snippet">
              {reactCodeSnippet}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify center">
        <div className="mx-auto">
          <NFTE contract="0xabefbc9fd2f806065b4f3c237d4b59d9a97bcac7" tokenId={post.tokenId} />
        </div>
      </div>
    </div>
  );
};

export default ShareNFTE;
