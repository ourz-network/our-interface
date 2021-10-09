import {
  generateMetadata,
  constructBidShares,
  constructMediaData,
  sha256FromBuffer,
  Zora,
  MediaData,
  BidShares,
} from "@zoralabs/zdk"; // Zora provider
import { NFTStorage } from "nft.storage";
import { ethers, BigNumberish, Signer, Contract, providers, BigNumber } from "ethers";
import { Hash } from "crypto";
import BalanceTree from "@/ethereum/merkle-tree/balance-tree"; // Creates merkle tree for splits
import pylonJSON from "@/ethereum/abis/OurPylon.json";
import proxyJSON from "@/ethereum/abis/OurProxy.json";
import factoryJSON from "@/ethereum/abis/OurFactory.json";
import editionJSON from "@/ethereum/abis/SingleEditionMintable.json";
import { SplitRecipient } from "@/utils/OurzSubgraph";
import { FormSplitRecipient, MintForm, ZNFTEdition } from "@/utils/CreateModule";
import { zeroAddress } from "@/utils/index";

// ourz
const factoryABI = factoryJSON.abi;
const pylonABI = pylonJSON.abi;
const proxyBytecode = proxyJSON.bytecode;

const initializeOurFactoryWSigner = ({ signer }: { signer: Signer }): Contract =>
  new ethers.Contract(process.env.NEXT_PUBLIC_FACTORY_4 as string, factoryABI, signer);

const initializeOurPylonWSigner = ({ signer }: { signer: Signer }): Contract =>
  new ethers.Contract(process.env.NEXT_PUBLIC_PYLON_4 as string, pylonABI, signer);

const initializeOurProxyAsPylonWSigner = ({
  proxyAddress,
  signer,
}: {
  proxyAddress: string;
  signer: Signer;
}): Contract =>
  new ethers.Contract(
    proxyAddress, // rinkeby
    pylonABI,
    signer
  );

// zora
const editionABI = editionJSON.abi;

const initializeZoraEditionsWSigner = ({ signer }: { signer: Signer }): Contract =>
  new ethers.Contract(process.env.NEXT_PUBLIC_ZEDITION_4 as string, editionABI, signer);

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
}: {
  signer: Signer;
  address: string;
  owners?: string[];
  formData: FormSplitRecipient[];
  nickname: string;
}): Promise<string> => {
  /** Step 1)
   * If user defined splits other than their own royalties,
   * format them for merkle tree & metadata
   * */
  const { rootHash, splitsForMeta } = formatSplits(formData);

  // init contracts
  const FACTORY_WRITE = initializeOurFactoryWSigner({ signer });
  const PYLON_WRITE = initializeOurPylonWSigner({ signer });

  // get deployment data to setup owners
  let deployData: string;
  if (owners) {
    // multiple owners
    deployData = PYLON_WRITE.interface.encodeFunctionData("setup", [owners]);
  } else {
    // signer is sole owner
    deployData = PYLON_WRITE.interface.encodeFunctionData("setup", [address]);
  }

  // determine address of new proxy
  const constructorArgs = ethers.utils.defaultAbiCoder.encode(["bytes32"], [rootHash]);
  const salt = ethers.utils.keccak256(constructorArgs);
  const codeHash = ethers.utils.keccak256(proxyBytecode);
  const proxyAddress = ethers.utils.getCreate2Address(
    process.env.NEXT_PUBLIC_FACTORY_4 as string,
    salt,
    codeHash
  );

  // Make transaction
  if (splitsForMeta && rootHash && deployData) {
    const proxyTx = await FACTORY_WRITE.createSplit(
      rootHash,
      deployData,
      JSON.stringify(splitsForMeta),
      nickname
    );

    // wait for transaction confirmation
    const proxyReceipt = await proxyTx.wait(2);
    if (proxyReceipt) {
      return proxyAddress;
    }
  }
  return "error";
};

// Prepare Media for minting on Zora, storing on IPFS and Arweave
export const createCryptomedia = async (
  mintForm: MintForm
): Promise<{
  cryptomedia:
    | Pick<ZNFTEdition, "animationUrl" & "animationHash" & "imageUrl" & "imageHash">
    | MediaData;
  bidShares?: BidShares;
}> => {
  // Generate metadataJSON
  const metadataJSON = JSON.stringify(mintForm.metadata); // unordered
  // const metadata = {
  //   version: "zora-20210101",
  //   name: mintForm.title,
  //   description: mintForm.description,
  //   mimeType: mintForm.mediaKind,
  // };
  // const metadataJSON = generateMetadata(metadata.version, metadata)

  // Upload files to nft.storage
  const endpoint = "https://api.nft.storage" as unknown as URL; // the default
  const token = `${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}`;
  const storage = new NFTStorage({ endpoint, token });

  // Collect mediaCID and metadataCID from nft.storage
  const mediaCID = await storage.storeBlob(mintForm.media.blob as unknown as Blob);
  const metadataCID = await storage.storeBlob(metadataJSON as unknown as Blob);

  // Save fileUrl and metadataUrl
  const mediaUrl = `https://${mediaCID}.ipfs.dweb.link`;
  const metadataUrl = `https://${metadataCID}.ipfs.dweb.link`;

  // arweave??
  // if (mintForm.mediaKind.includes("image")) {
  //   const arweaveMedia = await axios.post(`https://ipfs2arweave.com/permapin/${mediaCID}`);
  //   if (arweaveMedia) {
  //   }
  // }

  // Generate content hashes
  const contentHash = sha256FromBuffer(Buffer.from(mintForm.media.blob as ArrayBuffer));
  const metadataHash = sha256FromBuffer(Buffer.from(metadataJSON));

  if (mintForm.mintKind === ("1/1" || "1/1 Auction")) {
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
  const { mimeType } = mintForm.media;

  // still image
  if (
    mimeType.includes(".jpg") ||
    mimeType.includes(".jpeg") ||
    mimeType.includes(".jfif") ||
    mimeType.includes(".pjpeg") ||
    mimeType.includes(".pjp")
  ) {
    const cryptomedia = {
      // animationUrl: metadataUrl,
      // animationHash: metadataHash,
      animationUrl: " ",
      animationHash: zeroAddress,
      imageUrl: mediaUrl,
      imageHash: contentHash,
    };
    return { cryptomedia };

    // animated image
  }
  if (mimeType.startsWith("image")) {
    const cryptomedia = {
      animationUrl: mediaUrl,
      animationHash: contentHash,
      imageUrl: mediaUrl,
      imageHash: contentHash,
      // imageUrl: metadataUrl,
      // imageHash: metadataHash,
    };
    return { cryptomedia };
  }
  const cryptomedia = {
    animationUrl: mediaUrl,
    animationHash: contentHash,
    imageUrl: " ",
    imageHash: zeroAddress,
    // imageUrl: metadataUrl,
    // imageHash: metadataHash,
  };

  return { cryptomedia };
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
}): Promise<number> => {
  // Upload file to IPFS
  const { cryptomedia, bidShares } = await createCryptomedia(mintForm);

  // Mint to Zora Protocol
  if (cryptomedia && bidShares) {
    if (!proxyAddress && soloAddress) {
      const zora = getZora({ signer, networkId }); // minting for EOA

      const mintTx = await zora.mint(cryptomedia as MediaData, bidShares); // Make transaction

      const mintReceipt = await mintTx.wait(2); // Wait for Tx to process

      if (mintReceipt.events) {
        return parseInt(mintReceipt.events[0].topics[3], 16);
      }
    } else if (proxyAddress && !soloAddress) {
      const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer }); // minting for a Split Proxy

      const mintTx = await PROXY_WRITE.mintZora(cryptomedia, bidShares); // Make transaction

      const mintReceipt = await mintTx.wait(2); // Wait for Tx to process

      if (mintReceipt.events) {
        return parseInt(mintReceipt.events[0].topics[3], 16);
      }
    }
  }
  return -1;
};

export const createZoraEdition = async ({
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
  // eslint-disable-next-line consistent-return
}) => {
  // Upload file to IPFS
  const {
    cryptomedia,
  }: {
    cryptomedia: Pick<ZNFTEdition, "animationUrl" & "animationHash" & "imageUrl" & "imageHash">;
  } = await createCryptomedia(mintForm);
  const metadata = mintForm.metadata as ZNFTEdition;
  console.log(metadata);

  if (proxyAddress && !soloAddress) {
    const PROXY_WRITE = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });
    console.log(
      metadata.name,
      metadata.symbol,
      metadata.description,
      cryptomedia.animationUrl,
      cryptomedia.animationHash,
      cryptomedia.imageUrl,
      cryptomedia.imageHash,
      metadata.editionSize,
      mintForm.creatorBidShare * 100
    );

    const mintTx = await PROXY_WRITE.createZoraEdition(
      metadata.name,
      metadata.symbol,
      metadata.description,
      cryptomedia.animationUrl ? cryptomedia.animationUrl : "x",
      cryptomedia.animationHash,
      cryptomedia.imageUrl ? cryptomedia.imageUrl : "x",
      cryptomedia.imageHash,
      metadata.editionSize,
      mintForm.creatorBidShare * 100
    );
    const mintReceipt = await mintTx.wait(2);
    if (mintReceipt) {
      console.log(mintReceipt);
      return "a";
    }
  } else {
    const zora = initializeZoraEditionsWSigner({ signer });
    const mintTx = await zora.createEdition(
      metadata.name,
      metadata.symbol,
      metadata.description,
      cryptomedia.animationUrl,
      cryptomedia.animationHash,
      cryptomedia.imageUrl,
      cryptomedia.imageHash,
      metadata.editionSize,
      mintForm.creatorBidShare * 100
    );
    const mintReceipt = await mintTx.wait(2);
    if (mintReceipt) {
      console.log(mintReceipt);
      return "a";
    }
  }
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
}) => {
  // init Proxy instance as OurPylon, so owner can call Mint
  const proxyPylon = initializeOurProxyAsPylonWSigner({ proxyAddress, signer });

  /** Make transaction
   *  uint256 tokenId
   *  address tokenContract
   *  uint256 duration (time in seconds)
   *  uint256 reservePrice
   *  address curator (0x00 or owner address if no curator)
   *  uint8 curatorFeePercentage
   *  address auctionCurrency (must be 0x00 or WETH)
   */
  const ReservePrice: BigNumberish = ethers.utils.parseUnits(reservePrice.toString(), "ether");
  const auctionTx = await proxyPylon.createZoraAuction(
    tokenId,
    // zora media rinkeby
    tokenContract,
    duration,
    // parseUnits(`${reservePrice}`, "ether"),
    // ethers.BigNumber.from(reservePrice),
    ReservePrice,
    curator || proxyAddress,
    curatorFeePercentage || Number(0),
    auctionCurrency || "0x0000000000000000000000000000000000000000"
  );

  // Wait for Tx to process
  const auctionReceipt = await auctionTx.wait(2);

  if (auctionReceipt) {
    const auctionId = parseInt(auctionReceipt.events[3].topics[1], 16);
    return auctionId;
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

  if (needsIncremented) {
    const claimTx = await PROXY_WRITE.incrementThenClaimAll(account, allocation, proof);
    const claimReceipt = await claimTx.wait(2);

    if (claimReceipt) return true;
  } else {
    const claimTx = await PROXY_WRITE.claimETHForAllWindows(account, allocation, proof);
    const claimReceipt = await claimTx.wait(2);

    if (claimReceipt) return true;
  }
  return false;
};