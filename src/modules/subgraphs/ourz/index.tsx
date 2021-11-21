import { ApolloClient, InMemoryCache } from "@apollo/client";

// Ourz Mainnet subgraph studio
// const APIURL = `https://gateway.thegraph.com/api/${process.env.SUBGRAPH_KEY}/subgraphs/id/0x11cdfcb54576d5990219c426bf2c630115a2012a-0`;

// Ourz Mainnet subgraph
const MAINNET_URL = "https://api.thegraph.com/subgraphs/name/ourz-network/ourz-v1";

// Ourz Polygon subgraph
const POLYGON_URL = "https://api.thegraph.com/subgraphs/name/ourz-network/ourz-v1-polygon";

// Ourz Rinkeby subgraph
const RINKEBY_URL = "https://api.thegraph.com/subgraphs/name/nickadamson/ourzrinkebyv1";

export const OurzMainnetSubgraph = new ApolloClient({
  uri: MAINNET_URL,
  cache: new InMemoryCache(),
});

export const OurzPolygonSubgraph = new ApolloClient({
  uri: POLYGON_URL,
  cache: new InMemoryCache(),
});

export const OurzRinkebySubgraph = new ApolloClient({
  uri: RINKEBY_URL,
  cache: new InMemoryCache(),
});
