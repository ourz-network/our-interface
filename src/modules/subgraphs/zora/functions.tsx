import { ApolloClient, ApolloQueryResult, NormalizedCacheObject } from "@apollo/client";
import { ZoraMainnetSubgraph, ZoraPolygonSubgraph, ZoraRinkebySubgraph } from "./index";
import { ZORA_MEDIA_BY_CREATOR, ZORA_MEDIA_BY_ID, ZORA_MEDIA_BY_OWNER } from "./queries";
import { Media } from "@/utils/ZoraSubgraph";
import { formatUniquePost, NFTCard } from "../utils";

interface Data {
  media?: Media;
  medias?: Media[];
}

const zoraSubgraph = (chainId: number): ApolloClient<NormalizedCacheObject> => {
  switch (chainId) {
    case 1:
      // console.log(`Loading Zora Mainnet Subgraph`);
      return ZoraMainnetSubgraph;
      break;

    case 4:
      // console.log(`Loading Zora Rinkeby Subgraph`);
      return ZoraRinkebySubgraph;
      break;

    case 137:
      // console.log(`Loading Zora Polygon Subgraph`);
      return ZoraPolygonSubgraph;
      break;

    default:
      // console.log(`No Network Connected - Loading Zora Mainnet Subgraph`);
      return ZoraMainnetSubgraph;
      break;
  }
};

/**
 * Collect Zora media post by ID
 * @param {Number} id post number
 * @returns {Object} containing Zora media details
 */
export const getPostByID = async (id: number, chainId: number): Promise<NFTCard | null> => {
  const { data }: ApolloQueryResult<Data> = await zoraSubgraph(chainId).query({
    query: ZORA_MEDIA_BY_ID(id),
  });
  if (data?.media) {
    const post = await formatUniquePost(data.media);
    return post;
  }
  return null;
};

/**
 * Collect Zora media post by ID
 * @param {Number} id post number
 * @returns {Object} containing Zora media details
 */
export const getPostsByOwner = async (
  owner: string,
  chainId: number
): Promise<(NFTCard | null)[] | null> => {
  const { data }: ApolloQueryResult<Data> = await zoraSubgraph(chainId).query({
    query: ZORA_MEDIA_BY_OWNER(owner),
  });
  if (data?.medias) {
    const posts: (NFTCard | null)[] = [];
    await Promise.all(
      data.medias.map(async (media: Media) => {
        const post = await formatUniquePost(media);
        posts.push(post);
      })
    );
    return posts;
  }
  return null;
};

export const getPostsByCreator = async (
  creator: string,
  chainId: number
): Promise<(NFTCard | null)[] | null> => {
  const { data }: ApolloQueryResult<Data> = await zoraSubgraph(chainId).query({
    query: ZORA_MEDIA_BY_CREATOR(creator),
  });
  if (data?.medias) {
    const posts: (NFTCard | null)[] = [];
    await Promise.all(
      data.medias.map(async (media: Media) => {
        const post = await formatUniquePost(media);
        posts.push(post);
      })
    );

    return posts;
  }
  return null;
};
