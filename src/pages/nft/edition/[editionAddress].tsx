import { BigNumber, ethers } from "ethers";
import { GetStaticPaths, GetStaticProps } from "next";
import PageLayout from "@/components/Layout/PageLayout"; // Layout wrapper
import FullPageNFT from "@/common/components/NftCards/FullPage/FullPageNFT";
import {
  getAllOurzEditions,
  getPostByEditionAddress,
  getSplitOwners,
  getSplitRecipients,
} from "@/subgraphs/ourz/functions"; // GraphQL client
import { SplitRecipient } from "@/utils/OurzSubgraph";
import editionJSON from "@/ethereum/abis/SingleEditionMintable.json";
import editionPolygonJSON from "@/ethereum/abis/SingleEditionMintablePolygon.json";
import web3 from "@/app/web3";
import { NFTCard } from "@/modules/subgraphs/utils";
import useOwners from "@/common/hooks/useOwners";
import useRecipients from "@/common/hooks/useRecipients";
import useEditions from "@/common/hooks/useEditions";

const editionABI = editionJSON.abi;
const editionPolygonABI = editionPolygonJSON.abi;

const FullPageEdition = ({
  post,
  saleInfo,
  recipients,
  splitOwners,
}: {
  post: NFTCard;
  saleInfo: { maxSupply: number; currentSupply: number; salePrice: number; whitelistOnly: boolean };
  recipients: SplitRecipient[];
  splitOwners: string[];
}): JSX.Element => {
  const { signer, address } = web3.useContainer();
  const { isOwner } = useOwners({ address, splitOwners });
  const { firstSale } = useRecipients({ recipients, secondaryRoyalty: undefined });

  return (
    <PageLayout>
      <div className="flex overflow-y-hidden flex-col w-full h-auto min-h-screen bg-dark-background">
        <FullPageNFT
          post={post}
          saleInfo={saleInfo}
          recipients={recipients}
          chartData={firstSale}
          signer={signer}
          isOwner={isOwner}
        />
      </div>
    </PageLayout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const ourEditions = await getAllOurzEditions();

  const paths = [];
  if (ourEditions) {
    for (let i = ourEditions?.length - 1; i >= 0; i -= 1) {
      paths.push({ params: { editionAddress: `${ourEditions[i].id}` } });
    }
  }

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const editionAddress = context.params?.editionAddress;
  let post;
  let network;

  try {
    post = await getPostByEditionAddress(editionAddress as string, 137);
    if (post) {
      network = 137;
    }
  } catch (error) {
    post = await getPostByEditionAddress(editionAddress as string, 1);
    if (post) {
      network = 1;
    }
  }
  const matic: Network = {
    name: "matic",
    chainId: 137,
    _defaultProvider: (providers) =>
      new providers.JsonRpcProvider(
        `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
      ),
  };
  let queryProvider;
  if (network === 1) {
    queryProvider = ethers.providers.getDefaultProvider("mainnet", {
      infura: process.env.NEXT_PUBLIC_INFURA_ID,
      alchemy: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
      pocket: process.env.NEXT_PUBLIC_POKT_ID,
      etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_KEY,
    });
  } else {
    queryProvider = ethers.providers.getDefaultProvider(matic);
  }

  const editionContract = new ethers.Contract(
    editionAddress as string,
    network === 1 ? editionABI : editionPolygonABI,
    queryProvider
  );

  if (post && editionContract) {
    // subgraph query
    const recipients = await getSplitRecipients(post.creator, network);
    const splitOwners = await getSplitOwners(post.creator, network);

    // blockchain query
    let totalSupply = BigNumber.from(0);
    try {
      totalSupply = await editionContract.totalSupply();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      // reverts if no editions have minted yet
    }
    const editionSize = await editionContract.editionSize();
    const salePrice = await editionContract.salePrice();

    const saleInfo = {
      maxSupply: Number(editionSize.toString()),
      currentSupply: Number(totalSupply.toString()),
      salePrice: Number(ethers.utils.formatUnits(salePrice)),
    };
    return {
      props: {
        post,
        saleInfo,
        recipients,
        splitOwners,
      },
      revalidate: 1,
    };
  }
  return {
    notFound: true,
  };
};

export default FullPageEdition;
