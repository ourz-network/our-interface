import { ApolloClient, InMemoryCache } from "@apollo/client";

// Zora Mainnet subgraph
const MAINNET_URL = "https://api.thegraph.com/subgraphs/name/ourzora/zora-v1";

// Zora Polygon community subgraph
const POLYGON_URL = "https://api.thegraph.com/subgraphs/name/masterfile-co/zora-polygon";

// Zora Rinkeby subgraph
const RINKEBY_URL = "https://api.thegraph.com/subgraphs/name/ourzora/zora-v1-rinkeby";

export const ZoraMainnetSubgraph = new ApolloClient({
  uri: MAINNET_URL,
  cache: new InMemoryCache(),
});

export const ZoraPolygonSubgraph = new ApolloClient({
  uri: POLYGON_URL,
  cache: new InMemoryCache(),
});

export const ZoraRinkebySubgraph = new ApolloClient({
  uri: RINKEBY_URL,
  cache: new InMemoryCache(),
});
