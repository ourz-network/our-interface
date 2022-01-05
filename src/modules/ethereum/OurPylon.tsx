/* eslint-disable no-param-reassign */
import {
  // generateMetadata,
  constructBidShares,
  constructMediaData,
  sha256FromBuffer,
  Zora,
  MediaData,
  BidShares,
} from "@zoralabs/zdk"; // Zora provider
import { NFTStorage } from "nft.storage";
import { ethers, BigNumberish, Signer, Contract, providers, BigNumber, Transaction } from "ethers";
import BalanceTree from "@/ethereum/merkle-tree/balance-tree"; // Creates merkle tree for splits
import pylonJSON from "@/ethereum/abis/OurPylon.json";
import proxyJSON from "@/ethereum/abis/OurProxy.json";
import factoryJSON from "@/ethereum/abis/OurFactory.json";
import editionMintableJSON from "@/ethereum/abis/SingleEditionMintable.json";
import editionFactoryJSON from "@/ethereum/abis/SingleEditionMintableCreator.json";
import ahJSON from "@/ethereum/abis/AuctionHouse.json";
import { SplitRecipient } from "@/utils/OurzSubgraph";
import { FormSplitRecipient, MintForm, ZNFTEdition } from "@/utils/CreateModule";
import { Ourz20210928 } from "@/utils/20210928";

// ourz
const factoryABI = factoryJSON.abi;
const pylonABI = pylonJSON.abi;
const proxyBytecode = proxyJSON.bytecode;

const getOurFactoryAddress = (networkId: number): string => {
  switch (networkId) {
    case 1:
      return process.env.NEXT_PUBLIC_FACTORY_1 as string;
      break;

    case 4:
      return process.env.NEXT_PUBLIC_FACTORY_4 as string;
      break;

    case 137:
      return process.env.NEXT_PUBLIC_FACTORY_137 as string;
      break;

    default:
      return process.env.NEXT_PUBLIC_FACTORY_1 as string;
  }
};

const getPylonAddress = (networkId: number): string => {
  // process.env.NEXT_PUBLIC_PYLON
  switch (networkId) {
    case 1:
      return process.env.NEXT_PUBLIC_PYLON_1 as string;
      break;

    case 4:
      return process.env.NEXT_PUBLIC_PYLON_4 as string;
      break;

    case 137:
      return process.env.NEXT_PUBLIC_PYLON_137 as string;
      break;

    default:
      return process.env.NEXT_PUBLIC_PYLON_1 as string;
      break;
  }
};
const getAuctionHouseAddress = (networkId: number): string => {
  switch (networkId) {
    case 1:
      return process.env.NEXT_PUBLIC_ZAUCTION_1 as string;
      break;

    case 4:
      return process.env.NEXT_PUBLIC_ZAUCTION_4 as string;
      break;

    case 137:
      return process.env.NEXT_PUBLIC_ZAUCTION_137 as string;
      break;

    default:
      return process.env.NEXT_PUBLIC_ZAUCTION_1 as string;
      break;
  }
};
const getEditionFactoryAddress = (networkId: number): string => {
  switch (networkId) {
    case 1:
      return process.env.NEXT_PUBLIC_ZEDITION_1 as string;
      break;

    case 4:
      return process.env.NEXT_PUBLIC_ZEDITION_4 as string;
      break;

    case 137:
      return process.env.NEXT_PUBLIC_ZEDITION_137 as string;
      break;

    default:
      return process.env.NEXT_PUBLIC_ZEDITION_1 as string;
      break;
  }
};

const initializeOurFactoryWSigner = ({
  signer,
  networkId,
}: {
  signer: Signer;
  networkId: number;
}): Contract => new ethers.Contract(getOurFactoryAddress(networkId), factoryABI, signer);

const initializeOurPylonWSigner = ({
  signer,
  networkId,
}: {
  signer: Signer;
  networkId: number;
}): Contract => new ethers.Contract(getPylonAddress(networkId), pylonABI, signer);

const initializeOurProxyAsPylonWSigner = ({
  proxyAddress,
  signer,
}: {
  proxyAddress: string;
  signer: Signer;
}): Contract => new ethers.Contract(proxyAddress, pylonABI, signer);

// zora
const editionFactoryABI = editionFactoryJSON.abi;
const editionMintableABI = editionMintableJSON.abi;
const ahABI = ahJSON.abi;

const initializeEditionFactoryWSigner = ({
  signer,
  networkId,
}: {
  signer: Signer;
  networkId: number;
}): Contract => new ethers.Contract(getEditionFactoryAddress(networkId), editionFactoryABI, signer);

const initializeAuctionHouseWSigner = ({
  signer,
  networkId,
}: {
  signer: Signer;
  networkId: number;
}): Contract => new ethers.Contract(getAuctionHouseAddress(networkId), ahABI, signer);

const initializeEditionWSigner = ({
  signer,
  editionAddress,
}: {
  signer: Signer;
  editionAddress: string;
}): Contract => new ethers.Contract(editionAddress, editionMintableABI, signer);

export function getZoraQuery({
  injectedProvider,
  networkId,
}: {
  injectedProvider: providers.Web3Provider;
  networkId: number;
}): Zora {
  return new Zora(injectedProvider, networkId);
}

function getZora({ signer, networkId }: { signer: Signer; networkId: number }): Zora {
  return new Zora(signer, networkId);
}

/** Format data received from react-hook-form
 * Formats for: merkleTree to use when calling OurFactory,
 * & metadata for zNFT's and Subgraph.
 */
const formatSplits = (formData: FormSplitRecipient[]) => {
  // see https://github.com/mirror-xyz/splits
  let splitsForMerkle = []; // Required Format: [{account: '0x..', allocation: #}]

  // splitsForMeta will be JSON.stringify'd and emitted in an event during eth tx
  // this allows the information to be stored on the Subgraph rather than MongoDB
  let splitsForMeta = []; // [{address: '0x/ENS', name: 'name', role: 'role', shares: #}]

  splitsForMeta = formData.map(({ id, ...keepAttrs }) => keepAttrs); // remove id

  // change property names + add allocations for ease of use when claiming funds
  // webassembly in subgraph is tricky... hence toString() of Numbers. BigInt, more like BigBye
  splitsForMeta = splitsForMeta.map((split) => ({
    address: split.account,
    name: split.name,
    role: split.role,
    shares: split.shares.toString(),
    allocation: Number((Number(split.shares) * 1000000).toFixed(0)).toString(),
  }));

  // Format splits[] for merkle-tree. WILL NOT WORK if ENS names aren't translated to 0x0
  // keep address and allocation
  splitsForMerkle = splitsForMeta.map(({ name, role, shares, ...keepAttrs }) => keepAttrs);
  // Change 'address' -> 'account'
  splitsForMerkle = splitsForMerkle.map((split) => ({
    account: split.address,
    allocation: BigNumber.from(split.allocation),
  }));

  // Create Merkle Tree for Split
  const tree = new BalanceTree(splitsForMerkle);
  const rootHash = tree.getHexRoot();

  return { rootHash, splitsForMeta };
};

export const newProxy = async ({
  signer,
  address,
  owners,
  formData,
  nickname,
  networkId,
}: {
  signer: Signer;
  address: string;
  owners?: string[];
  formData: FormSplitRecipient[];
  nickname: string;
  networkId: number;
}): Promise<string> => {
  /** Step 1)
   * If user defined splits other than their own royalties,
   * format them for merkle tree & metadata
   * */
  const { rootHash, splitsForMeta } = formatSplits(formData);

  // init contracts
  const FACTORY_WRITE: Contract = initializeOurFactoryWSigner({ signer, networkId });
  const PYLON_WRITE: Contract = initializeOurPylonWSigner({ signer, networkId });

  // get deployment data to setup owners
  let deployData: string;
  if (owners) {
    // multiple owners
    deployData = PYLON_WRITE.interface.encodeFunctionData("setup", [owners]);
  } else {
    const owner = [address];
    // signer is sole owner
    deployData = PYLON_WRITE.interface.encodeFunctionData("setup", [owner]);
  }

  // determine address of new proxy
  const constructorArgs = ethers.utils.defaultAbiCoder.encode(["bytes32"], [rootHash]);
  const salt = ethers.utils.keccak256(constructorArgs);
  const codeHash = ethers.utils.keccak256(proxyBytecode);
  const proxyAddress = ethers.utils.getCreate2Address(
    process.env.NEXT_PUBLIC_FACTORY_1 as string,
    salt,
    codeHash
  );

  // Make transaction
  if (splitsForMeta && rootHash && deployData) {
    const proxyTx: Transaction = await FACTORY_WRITE.createSplit(
      rootHash,
      deployData,
      JSON.stringify(splitsForMeta),
      nickname
    );

    // wait for transaction confirmation
    const proxyReceipt = await proxyTx.wait();
    if (proxyReceipt) {
      return proxyAddress;
    }
  }
  return "error";
};

// Prepare Media for minting on Zora, storing on IPFS and Arweave
export const createCryptomedia = async (
  mintForm: MintForm
): Promise<
  | {
      cryptomedia:
        | Pick<ZNFTEdition, "animationUrl" & "animationHash" & "imageUrl" & "imageHash">
        | MediaData;
      bidShares?: BidShares;
    }
  | undefined
> => {
  // Upload files to nft.storage
  const endpoint = "https://api.nft.storage" as unknown as URL; // the default
  const token = `${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY as string}`;
  const storage = new NFTStorage({ endpoint, token });

  // Collect mediaCID and metadataCID from nft.storage
  const mediaCID = await storage.storeBlob(mintForm.media.blob as unknown as Blob);

  // Save fileUrl and metadataUrl
  const mediaUrl = `https://ipfs.io/ipfs/${mediaCID}`;

  // arweave??
  // if (mintForm.mediaKind.includes("image")) {
  //   const arweaveMedia = await axios.post(`https://ipfs2arweave.com/permapin/${mediaCID}`);
  //   if (arweaveMedia) {
  //   }
  // }

  // Generate content hashes
  const contentHash = sha256FromBuffer(Buffer.from(mintForm.media.blob as ArrayBuffer));

  if (mintForm.mintKind === "1/1" || mintForm.mintKind === "1/1 Auction") {
    const metadata = {
      name: mintForm.metadata.name,
      description: mintForm.metadata.description,
      mimeType: mintForm.metadata.mimeType,
      external_url: `www.ourz.network`,
      version: "zora-20210604",
      attributes: mintForm.metadata.split_recipients.map((recipient: SplitRecipient) => ({
        account: recipient?.user.id,
        name: recipient?.name,
        role: recipient?.role,
        shares: recipient?.shares,
        allocation: recipient?.allocation,
      })),
    };
    const metadataJSON = JSON.stringify(metadata); // unordered

    // Upload files to nft.storage
    const metadataCID = await storage.storeBlob(metadataJSON as unknown as Blob);
    const metadataUrl = `https://ipfs.io/ipfs/${metadataCID}`;
    const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

    // Construct mediaData object
    const cryptomedia = constructMediaData(mediaUrl, metadataUrl, contentHash, metadataHash);

    /** Construct bidShares object
     * Note: this is for future royalties on NFT sale,
     * which is > then < divided up via splits.
     */
    const bidShares = constructBidShares(
      Number(mintForm.creatorBidShare),
      100 - Number(mintForm.creatorBidShare),
      0 // Previous owner share. Always 0 when minting
    );

    return { cryptomedia, bidShares };
  }
  const { mimeType } = mintForm.metadata as Ourz20210928;

  // image
  if (mimeType.startsWith("image")) {
    const cryptomedia = {
      animationUrl: " ",
      animationHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      imageUrl: mediaUrl,
      imageHash: contentHash,
      // imageUrl: metadataUrl,
      // imageHash: metadataHash,
    };
    return { cryptomedia };
  }
  // video
  if (mimeType.startsWith("video")) {
    const cryptomedia = {
      animationUrl: mediaUrl,
      animationHash: contentHash,
      imageUrl: " ",
      imageHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      // imageUrl: metadataUrl,
      // imageHash: metadataHash,
    };
    return { cryptomedia };
  }
  return undefined;
};

export const mintZora = async ({
  signer,
  networkId,
  soloAddress,
  proxyAddress,
  mintForm,
}: {
  signer: Signer;
  networkId: number;
  soloAddress?: string;
  proxyAddress?: string;
  mintForm: MintForm;
}): Promise<number | null> => {
  // Upload file to IPFS
  const { cryptomedia, bidShares } = await createCryptomedia(mintForm);
  // Mint to Zora Protocol
  if (cryptomedia && bidShares) {
    if (!proxyAddress && soloAddress) {
      const zora = getZora({ signer, networkId }); // minting for EOA

      const mintTx = await zora.mint(cryptomedia as MediaData, bidShares); // Make transaction

      const mintReceipt = await mintTx.wait(); // Wait for Tx to process

      if (mintReceipt.events) {
        return parseInt(mintReceipt.events[0].topics[3], 16);
      }
    } else if (proxyAddress && !soloAddress) {
      const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer }); // minting for a Split Proxy

      if (mintForm.mintKind === "1/1") {
        const mintTx = await PROXY_WRITE.mintZNFT(cryptomedia, bidShares); // Make transaction

        const mintReceipt = await mintTx.wait(); // Wait for Tx to process

        if (mintReceipt.events) {
          return parseInt(mintReceipt.events[0].topics[3], 16);
        }
      } else if (mintForm.mintKind === "1/1 Auction" && mintForm.auctionInfo) {
        const { auctionInfo } = mintForm;
        const ReservePrice = ethers.utils.parseUnits(auctionInfo.reservePrice.toString(), "ether");
        const Duration = 60 * 60 * auctionInfo.duration;

        const mintTx = await PROXY_WRITE.mintToAuctionForETH(
          cryptomedia,
          bidShares,
          Duration,
          ReservePrice
        ); // Make transaction

        const mintReceipt = await mintTx.wait(); // Wait for Tx to process

        if (mintReceipt.events) {
          return parseInt(mintReceipt.events[0].topics[3], 16);
        }
      }
    }
  }
  return null;
};

export const createZoraEdition = async ({
  signer,
  soloAddress,
  proxyAddress,
  mintForm,
  networkId,
}: {
  signer: Signer;
  soloAddress?: string;
  proxyAddress?: string;
  mintForm: MintForm;
  networkId: number;
  // eslint-disable-next-line consistent-return
}): Promise<number | undefined> => {
  // Upload file to IPFS
  const { cryptomedia } = await createCryptomedia(mintForm);
  const metadata = mintForm.metadata as ZNFTEdition;
  const royalty = mintForm.creatorBidShare * 100;
  // const BPS = BigNumber.from(royalty);
  const salePrice = ethers.utils.parseUnits(metadata?.salePrice?.toString() || "0", "ether");

  if (proxyAddress && !soloAddress) {
    const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });

    const mintTx = await PROXY_WRITE.createZoraEdition(
      metadata.name,
      metadata.symbol,
      metadata.description,
      cryptomedia.animationUrl,
      cryptomedia.animationHash,
      cryptomedia.imageUrl,
      cryptomedia.imageHash,
      metadata.editionSize,
      royalty,
      salePrice,
      metadata.publicMint
    );

    const mintReceipt = await mintTx.wait();
    if (mintReceipt) {
      return mintReceipt.events[metadata.salePrice > 0 ? 4 : 3].args[0];
    }
  } else {
    const zora = initializeEditionFactoryWSigner({ signer, networkId });
    const mintTx = await zora.createEdition(
      metadata.name,
      metadata.symbol,
      metadata.description,
      cryptomedia.animationUrl,
      cryptomedia.animationHash,
      cryptomedia.imageUrl,
      cryptomedia.imageHash,
      metadata.editionSize,
      royalty,
      salePrice,
      metadata.publicMint || false
    );
    const mintReceipt = await mintTx.wait();
    if (mintReceipt) {
      return mintReceipt.events[metadata.salePrice > 0 ? 4 : 3].args[0];
    }
  }
};

export const purchaseEdition = async ({
  signer,
  editionAddress,
  salePrice,
}: {
  signer: Signer;
  editionAddress: string;
  salePrice: number;
}): Promise<boolean> => {
  editionAddress = ethers.utils.getAddress(editionAddress);

  const edition = initializeEditionWSigner({ signer, editionAddress });
  const purchaseTx = await edition.purchase({
    value: ethers.utils.parseUnits(salePrice.toString()),
  });
  const txReceipt = await purchaseTx.wait();
  if (txReceipt?.events[0]?.event === "EditionSold" && txReceipt?.status === 1) {
    return true;
  }
  return false;
};

export const setApprovedMinter = async ({
  signer,
  proxyAddress,
  editionAddress,
  minterAddress,
  approved,
}: {
  signer: Signer;
  proxyAddress: string;
  editionAddress: string;
  minterAddress: string;
  approved: boolean;
}): Promise<boolean> => {
  proxyAddress = ethers.utils.getAddress(proxyAddress);

  editionAddress = ethers.utils.getAddress(editionAddress);
  const PROXY_WRITE: Contract = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
  const approveTx: Transaction = await PROXY_WRITE.setEditionMinter(
    editionAddress,
    minterAddress,
    approved
  );
  const txReceipt = await approveTx.wait();
  if (txReceipt?.status === 1) {
    return true;
  }
  return false;
};

export const withdrawEditionFunds = async ({
  signer,
  proxyAddress,
  editionAddress,
}: {
  signer: Signer;
  proxyAddress: string;
  editionAddress: string;
}): Promise<boolean> => {
  const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
  const withdrawTx = await PROXY_WRITE.withdrawEditionFunds(editionAddress);
  const txReceipt = await withdrawTx.wait();
  if (txReceipt?.events[0]?.event === "ETHReceived" && txReceipt?.status === 1) {
    return true;
  }
  return false;
};
export const setEditionPrice = async ({
  signer,
  proxyAddress,
  editionAddress,
  salePrice,
}: {
  signer: Signer;
  proxyAddress: string;
  editionAddress: string;
  salePrice: string;
}): Promise<boolean> => {
  const formattedPrice = ethers.utils.parseUnits(salePrice);
  const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
  const pricingTx = await PROXY_WRITE.setEditionPrice(editionAddress, formattedPrice);
  const txReceipt = await pricingTx.wait();
  if (txReceipt?.events[0]?.data && txReceipt?.status === 1) {
    return true;
  }
  return false;
};

export const mintEditionsToRecipients = async ({
  signer,
  proxyAddress,
  editionAddress,
  recipients,
}: {
  signer: Signer;
  proxyAddress: string;
  editionAddress: string;
  recipients: string[];
}): Promise<boolean> => {
  const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
  const mintTx = await PROXY_WRITE.mintEditionsTo(editionAddress, recipients);
  const txReceipt = await mintTx.wait();
  if (txReceipt?.events[0] && txReceipt?.status === 1) {
    return true;
  }
  return false;
};
export const updateEditionURIs = async ({
  signer,
  proxyAddress,
  editionAddress,
  imageURI,
  animationURI,
}: {
  signer: Signer;
  proxyAddress: string;
  editionAddress: string;
  imageURI: string;
  animationURI: string;
}): Promise<boolean> => {
  const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
  const tx = await PROXY_WRITE.updateEditionURLs(editionAddress, imageURI, animationURI);
  const txReceipt = await tx.wait();
  if (txReceipt?.events[0] && txReceipt?.status === 1) {
    return true;
  }
  return false;
};

export const createZoraAuction = async ({
  signer,
  proxyAddress,
  tokenId,
  tokenContract,
  duration,
  reservePrice,
  curator,
  curatorFeePercentage,
  auctionCurrency,
}: {
  signer: Signer;
  proxyAddress: string;
  tokenId: string;
  tokenContract: string;
  duration: number;
  reservePrice: number;
  curator: string;
  curatorFeePercentage: number;
  auctionCurrency: string;
}): Promise<number> => {
  // init Proxy instance as OurPylon, so owner can call Mint
  const proxyPylon = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });

  const ReservePrice: BigNumberish = ethers.utils.parseUnits(reservePrice.toString(), "ether");
  const Duration = 60 * 60 * duration;
  // console.log(
  //   `${Duration} seconds // ${Duration / 60} minutes // ${Duration / 60 / 60} Hours // ${
  //     Duration / 60 / 60 / 24
  //   } Days`
  // );

  const auctionTx = await proxyPylon.createZoraAuction(
    tokenId,
    tokenContract,
    Duration,
    ReservePrice,
    curator || proxyAddress,
    curatorFeePercentage || Number(0),
    auctionCurrency || "0x0000000000000000000000000000000000000000"
  );

  // Wait for Tx to process
  const auctionReceipt = await auctionTx.wait();

  if (auctionReceipt) {
    const auctionId = parseInt(auctionReceipt.events[3].topics[1], 16);
    return auctionId;
  }
  return -1;
};
export const placeBidZoraAH = async ({
  signer,
  auctionId,
  bidAmount,
  networkId,
}: {
  signer: Signer;
  auctionId: number;
  bidAmount: string;
  networkId: number;
}): Promise<number> => {
  const AuctionHouse = initializeAuctionHouseWSigner({ signer, networkId });

  const bid: BigNumberish = ethers.utils.parseUnits(bidAmount.toString(), "ether");

  const bidTx = await AuctionHouse.createBid(auctionId, bid, {
    value: bid,
  });

  // Wait for Tx to process
  const bidReceipt = await bidTx.wait();

  if (bidReceipt) {
    // eslint-disable-next-line no-console
    console.log(bidReceipt);
  }
  return -1;
};

export const claimFunds = async ({
  signer,
  address,
  proxyAddress,
  needsIncremented,
  splits,
}: {
  signer: Signer;
  address: string;
  proxyAddress: string;
  needsIncremented: boolean;
  splits: (SplitRecipient & { __typename: string })[];
}): Promise<boolean> => {
  // Format splits[] for merkle-tree. WILL NOT WORK if ENS names aren't translated to 0x0
  // keep address and allocation
  const splitsForMerkle = splits
    .map(({ name, role, shares, __typename, ...keepAttrs }) => keepAttrs)
    .map((split: { user: { id: string }; allocation: string }) => ({
      // Change 'address' -> 'account'
      account: split.user.id,
      allocation: BigNumber.from(split.allocation),
    }));

  // find users account & allocation to retreive proof
  const signersSplit = splitsForMerkle.find(
    (split) => split.account === address.toString().toLowerCase()
  );
  if (!signersSplit) {
    return false;
  }
  const { account, allocation } = signersSplit;

  // Create Merkle Tree for Split and then get proof
  const tree = new BalanceTree(splitsForMerkle);
  const proof = tree.getProof(account, allocation);

  // claim funds with proof
  const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });

  if (!needsIncremented) {
    const claimTx = await PROXY_WRITE.claimETHForAllWindows(account, allocation, proof);
    const claimReceipt = await claimTx.wait();

    if (claimReceipt) return true;
  } else {
    const claimTx = await PROXY_WRITE.incrementThenClaimAll(account, allocation, proof);
    const claimReceipt = await claimTx.wait();

    if (claimReceipt) return true;
  }
  return false;
};
