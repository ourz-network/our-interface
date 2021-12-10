import { Zora } from "@zoralabs/zdk";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";
import PageLayout from "@/components/Layout/PageLayout"; // Layout wrapper
import FullPageNFT from "@/common/components/NftCards/FullPage/FullPageNFT";
import { getAllOurzTokens, getSplitOwners, getSplitRecipients } from "@/subgraphs/ourz/functions"; // GraphQL client
import { Recipient } from "@/utils/OurzSubgraph";
import { getPostByID } from "@/modules/subgraphs/zora/functions";
import { NFTCard } from "@/modules/subgraphs/utils";
import web3 from "@/app/web3";
import useOwners from "@/common/hooks/useOwners";
import useRecipients from "@/common/hooks/useRecipients";
import { getQueryProvider } from "@/utils/index";

const FullPageZNFT = ({
  post,
  recipients,
  splitOwners,
}: {
  post: NFTCard;
  recipients: Recipient[];
  splitOwners: string[];
}): JSX.Element => {
  const { signer, address, network } = web3.useContainer();
  const { isOwner } = useOwners({ address, splitOwners });
  const { firstSale } = useRecipients({ recipients, secondaryRoyalty: undefined });
  const [altChainPost, setAltChainPost] = useState();

  useEffect(() => {
    async function getPost() {
      const newPost = await getPostByID(Number(post.tokenId), network?.chainId);

      setAltChainPost(newPost);
    }
    if (post?.tokenId) {
      getPost().then(
        () => {},
        () => {}
      );
    }
  }, [network, post?.tokenId]);

  return (
    <PageLayout>
      <div className="flex overflow-y-hidden flex-col w-full h-auto min-h-screen bg-dark-background">
        {altChainPost ? (
          <FullPageNFT
            post={altChainPost}
            isOwner={isOwner}
            signer={signer}
            // chartData={firstSale}
            // recipients={recipients}
          />
        ) : (
          <FullPageNFT
            post={post}
            isOwner={isOwner}
            signer={signer}
            chartData={firstSale}
            recipients={recipients}
          />
        )}
      </div>
    </PageLayout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const ourTokens = await getAllOurzTokens(1);

  const paths = [];
  if (ourTokens) {
    for (let i = ourTokens.length - 1; i >= 0; i -= 1) {
      paths.push({ params: { networkId: "1", tokenId: `${ourTokens[i].id}` } });
    }
  }

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const networkId = Number(context.params?.networkId);
  const tokenId = context.params?.tokenId;
  const post = await getPostByID(Number(tokenId), networkId);

  const queryProvider = getQueryProvider(networkId);

  const zoraQuery = new Zora(queryProvider, networkId);

  const creatorAddress = await zoraQuery.fetchCreator(tokenId as string);
  let recipients;
  let splitOwners;
  try {
    recipients = await getSplitRecipients(creatorAddress, 1);
    splitOwners = await getSplitOwners(creatorAddress, 1);
  } catch (error) {
    //
  }

  return {
    props: {
      post,
      recipients,
      splitOwners,
    },
    revalidate: 5,
  };
};

export default FullPageZNFT;
