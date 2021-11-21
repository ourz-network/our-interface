import { ApolloClient, ApolloQueryResult, NormalizedCacheObject } from "@apollo/client";
import { OurzMainnetSubgraph, OurzPolygonSubgraph, OurzRinkebySubgraph } from "./index"; // Apollo Client
import {
  ALL_TOKENS,
  ALL_EDITIONS,
  ALL_USER_ADDRESSES,
  ALL_PROXY_ADDRESSES,
  SPLITS_BY_OWNER,
  SPLITS_BY_RECIPIENT,
  EDITION_INFO,
  RECIPIENTS_BY_ID,
} from "./queries"; // GraphQL Queries
import { Split, SplitZNFT, SplitEdition, User, Recipient } from "@/utils/OurzSubgraph";
import { formatEditionPost, NFTCard } from "../utils";

interface Data {
  split: Split | null;
  splits: Split[] | null;
  user: User | null;
  users: User[] | null;
  splitZNFT: SplitZNFT | null;
  splitZNFTs: SplitZNFT[] | null;
  splitEdition: SplitEdition | null;
  splitEditions: SplitEdition[] | null;
}

const ourzSubgraph = (chainId: number): ApolloClient<NormalizedCacheObject> => {
  switch (chainId) {
    case 1:
      // console.log(`Loading Ourz Mainnet Subgraph`);
      return OurzMainnetSubgraph;
      break;

    case 4:
      // console.log(`Loading Ourz Rinkeby Subgraph`);
      return OurzRinkebySubgraph;
      break;

    case 137:
      // console.log(`Loading Ourz Polygon Subgraph`);
      return OurzPolygonSubgraph;
      break;

    default:
      // console.log(`No Network Connected - Loading Ourz Mainnet Subgraph`);
      return OurzMainnetSubgraph;
      break;
  }
};

export const getAllProfilePaths = async (chainId: number): Promise<string[] | null> => {
  const queryUsers: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: ALL_USER_ADDRESSES(),
  });
  const querySplits: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: ALL_PROXY_ADDRESSES(),
  });

  const addresses: string[] = [];
  if (queryUsers?.data && querySplits?.data) {
    const { users } = queryUsers.data;
    users?.map((user) => addresses.push(user.id));
    const { splits } = querySplits.data;
    splits?.map((proxy) => addresses.push(proxy.id));
  }
  return addresses;
};

export const getAllOurzTokens = async (chainId: number): Promise<SplitZNFT[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: ALL_TOKENS(),
  });

  if (data) {
    return data.splitZNFTs;
  }
  return null;
};

export const getAllOurzEditions = async (chainId: number): Promise<SplitEdition[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: ALL_EDITIONS(),
  });

  if (data) {
    return data.splitEditions;
  }
  return null;
};

/**
 * Collect Split Proxies owned by a specific address
 * @param {String} owner ethereum address
 * @returns {Object} containing all split contracts owned by owner
 */
export const getSplitRecipients = async (
  proxyAddress: string,
  chainId: number
): Promise<Recipient[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: RECIPIENTS_BY_ID(proxyAddress),
  });

  if (data?.split) {
    return data.split.recipients;
  }
  return null;
};
/**
 * Collect Split Proxies owned by a specific address
 * @param {String} owner ethereum address
 * @returns {Object} containing the owners of a split
 */
export const getSplitOwners = async (
  proxyAddress: string,
  chainId: number
): Promise<string[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: RECIPIENTS_BY_ID(proxyAddress),
  });

  if (data?.split) {
    const proxyOwners = data.split.owners.map((owner) => owner.id);
    return proxyOwners;
  }
  return null;
};

/**
 * Collect Split Proxies owned by a specific address
 * @param {String} ownerAddress ethereum address
 * @returns {Object} containing all split contracts owned by owner
 */
export const getOwnedSplits = async (
  ownerAddress: string,
  chainId: number
): Promise<Split[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: SPLITS_BY_OWNER(ownerAddress),
  });

  if (data?.user) {
    return data.user.ownedSplits;
  }
  return [];
};

/**
 * Collect Split Proxies claimable by a specific address
 * @param {String} recipientAddress ethereum address
 * @returns {Object} containing all split contracts claimable by recipient
 */
export const getClaimableSplits = async (
  recipientAddress: string,
  chainId: number
): Promise<Recipient[] | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: SPLITS_BY_RECIPIENT(recipientAddress),
  });

  if (data?.user) {
    return data.user.recipientInfo;
  }
  return [];
};

/**
 * Collect metadata for an Edition Contract
 * @param {String} editionAddress ethereum address
 * @returns {Object} containing metadata
 */
export const getEditionMetadata = async (
  editionAddress: string,
  chainId: number
): Promise<SplitEdition | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: EDITION_INFO(editionAddress),
  });

  if (data) {
    return data.splitEdition;
  }
  return null;
};

/**
 * Collect metadata for an Edition Contract
 * @param {String} editionAddress ethereum address
 * @returns {Object} containing metadata
 */
export const getPostByEditionAddress = async (
  editionAddress: string,
  chainId: number
): Promise<NFTCard | null> => {
  const { data }: ApolloQueryResult<Data> = await ourzSubgraph(chainId).query({
    query: EDITION_INFO(editionAddress),
  });
  if (data?.splitEdition) {
    const post = formatEditionPost(data.splitEdition);
    return post;
  }
  return null;
};
