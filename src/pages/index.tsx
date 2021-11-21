import Head from "next/head";
import React, { useState } from "react"; // React state management
import { GetStaticProps } from "next";
import { Zora } from "@zoralabs/zdk";
import { ethers } from "ethers";
import PageLayout from "@/components/Layout/PageLayout";
import { getPostByID } from "@/subgraphs/zora/functions"; // Post collection helper
import MasonryNFT from "@/common/components/NftCards/Preview/MasonryNFT";
import { Media } from "@/utils/ZoraSubgraph";
import { Ourz20210928 } from "@/utils/20210928";

const Home = ({
  postsToSet,
  loadMoreStartIndex,
}: {
  postsToSet: Media & { metadata: Ourz20210928 }[];
  loadMoreStartIndex: number;
}): JSX.Element => {
  const [posts, setPosts] = useState(postsToSet); // Posts array
  const [loading, setLoading] = useState(false); // Button loading state
  const [numPosts, setNumPosts] = useState(loadMoreStartIndex); // Number of loadable posts

  const collectMore = async () => {
    setLoading(true); // Toggle button loading

    const idsToSearch = [];
    // For numPosts ... max(numPosts - 24, 0)
    for (let i = numPosts; i >= numPosts - 23; i -= 1) {
      idsToSearch.push(i);
    }
    setNumPosts(numPosts - 24); // Update number of loadable posts count

    const newPosts: Media[] = [];
    const completeFetch = await Promise.all(
      idsToSearch.map(async (id) => {
        // Collect post
        const post = await getPostByID(id);
        // Push post to newPosts
        if (post != null) {
          newPosts.push(post);
        }
      })
    );

    if (completeFetch) {
      setPosts([...posts, ...newPosts]); // Append newPosts to posts array
      setLoading(false); // Toggle button loading
    }
  };

  return (
    <PageLayout>
      <Head>
        <title>ourz.network</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex flex-col w-full min-h-screen landingPage bg-dark-background">
        {posts.length >= 0 ? (
          // If posts array contains at least 1 post
          <>
            <div className="mx-auto w-full h-full max-w-11/12 xl:max-w-5/6">
              <div className="w-full h-full xl:space-x-4 xl:space-y-4 timeline xl:grid">
                {posts.map((post) => (
                  // For each Zora post, Return Post component

                  <MasonryNFT key={post?.name} post={post} />
                ))}
              </div>
            </div>
            {posts && posts.length >= 0 && posts[posts.length - 1]?.id !== "0" ? (
              // If there remain posts that can be loaded, display button
              <button
                onClick={() => collectMore()}
                disabled={loading}
                className={`w-auto mx-auto my-12 text-center transition-opacity px-3 py-1 mainButton border border-dark-border text-dark-primary${
                  loading ? `animate-pulse text-dark-primary` : ""
                }`}
                type="button"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            ) : (
              // Else, display text signalling (end, beginning)
              <div className="">
                <span>Is this the end or beginning? You decide.</span>
              </div>
            )}
          </>
        ) : (
          // Else, display loading state
          <div className="content-center items-center mx-auto mt-32 w-8 h-8 text-center transition-opacity animate-pulse bg-ourange-500 ll">
            {/* <h3 className="px-3 py-1 bg-dark-background">Loading...</h3> */}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryProvider = ethers.providers.getDefaultProvider("homestead", {
    infura: process.env.NEXT_PUBLIC_INFURA_ID,
    alchemy: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
    pocket: process.env.NEXT_PUBLIC_POKT_ID,
    etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_KEY,
  });
  const zoraQuery = new Zora(queryProvider, 1);
  const unburned = Number((await zoraQuery.fetchTotalMedia()) - 1);

  const maxSupply = parseInt(await zoraQuery.fetchMediaByIndex(unburned), 10);

  const requests = [];
  const postsToSet: Media[] = [];

  if (maxSupply) {
    const ids = [];
    for (let i = maxSupply; i >= maxSupply - 24; i -= 1) {
      ids.push(i);
    }

    await Promise.all(
      ids.map(async (id) => {
        const post = await getPostByID(id);
        if (post != null) {
          postsToSet.push(post);
        }
      })
    ).then();
    return {
      props: {
        postsToSet: JSON.parse(JSON.stringify(postsToSet)),
        loadMoreStartIndex: maxSupply - 24,
      },
      revalidate: 10,
    };
    //   const ourzSampleTokenIDs = [
    //     3689, 3699, 3733, 3741, 3759, 3772, 3773, 3774, 3829, 3831, 3858, 3898,
    //   ];
    //   await Promise.all(
    //     ourzSampleTokenIDs.map(async (id) => {
    //       // Collect post
    //       const post = await getPostByID(id);
    //       if (post != null) {
    //         postsToSet.push(post);
    //       }
    //     })
    //   ).then();
    //   return {
    //     props: {
    //       postsToSet: JSON.parse(JSON.stringify(postsToSet)),
    //       loadMoreStartIndex: 0,
    //     },
    //     revalidate: 10,
    //   };
  }
  return { notFound: true };
};

export default Home;
