/* eslint-disable no-underscore-dangle */
import React, { FC, useEffect, useState } from "react"; // State management
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router"; // Page redirects (static routing)
import { ParsedUrlQuery } from "querystring";
import web3 from "@/app/web3";
import { getPostsByOwner } from "@/subgraphs/zora/functions"; // Post retrieval function
import { getAllProfilePaths } from "@/subgraphs/ourz/functions";
import { Media } from "@/utils/ZoraSubgraph";
import { addressLength } from "@/utils/index";
import { NFTCard } from "@/modules/subgraphs/utils";
import useOwners from "@/common/hooks/useOwners";
import PageLayout from "@/components/Layout/PageLayout";
import ProfileHeader from "@/common/components/ProfileHeader";
import SquareGrid from "@/common/components/NftCards/SquareGrid";

interface ProfilePageProps {
  redirectUsername: string;
  usernameOrAddress: string;
  posts: NFTCard[];
}

const ProfilePage: FC<ProfilePageProps> = ({
  redirectUsername,
  usernameOrAddress,
  posts,
}: ProfilePageProps): JSX.Element => {
  const router = useRouter();
  const { network, address } = web3.useContainer();
  const { isOwner } = useOwners({ address, ownerAddress: usernameOrAddress });
  const [altChainPosts, setAltChainPosts] = useState();

  // if user's wallet is connected to a different chain
  useEffect(() => {
    async function getPosts() {
      const ownedMedia: Media[] = await getPostsByOwner(usernameOrAddress, network?.chainId);
      setAltChainPosts([...ownedMedia.reverse()]);
    }

    getPosts().then(
      () => {},
      () => {}
    );
  }, [network, usernameOrAddress]);

  if (router.isFallback) {
    return (
      <PageLayout>
        <p className="my-auto w-full text-center animate-pulse text-dark-primary">Loading...</p>
      </PageLayout>
    );
  }

  return (
    <>
      {/* <Head /> */}
      <PageLayout>
        <ProfileHeader linkAddress={usernameOrAddress} isOwner={isOwner} />
        {/* eslint-disable-next-line no-nested-ternary */}
        {altChainPosts ? (
          <div className="mx-auto">
            <SquareGrid posts={altChainPosts} />
          </div>
        ) : posts?.length > 0 ? (
          <div className="mx-auto">
            <SquareGrid posts={posts} />
          </div>
        ) : (
          <div className="mx-auto mt-6 h-full text-center text-dark-primary">
            Empty Collection{" "}
            <span role="img" aria-label="Frown Face">
              ☹️
            </span>
          </div>
        )}
      </PageLayout>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths: { params: ParsedUrlQuery }[] = [];
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const networkId = Number(context.params?.networkId);
  const usernameOrAddress = context.params?.usernameOrAddress;

  const getPosts = async (ethAddress: string) => {
    const ownedMedia: Media[] = await getPostsByOwner(ethAddress, networkId);
    // const createdMedia: Media[] = await getPostsByCreator(user.ethAddress);
    const posts = [
      ...ownedMedia.reverse(),
      //  ...createdMedia.reverse()
    ];
    return { posts };
  };

  const { posts } = await getPosts(usernameOrAddress);
  return {
    props: {
      usernameOrAddress,
      posts,
    },
    revalidate: 10,
  };
};

export default ProfilePage;
