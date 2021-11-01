import { useState, useEffect } from "react";
import {
  getOwnedSplits,
  getClaimableSplits,
  getPostByEditionAddress,
} from "@/modules/subgraphs/ourz/functions";
import { Split, Recipient } from "@/utils/OurzSubgraph";
import { getPostByID } from "@/modules/subgraphs/zora/functions";
import { claimFunds } from "@/modules/ethereum/OurPylon";
import { NFTCard } from "@/modules/subgraphs/utils";

const useSplits = ({ address }: { address: string | undefined }) => {
  // all user's splits
  const [ownedSplits, setOwnedSplits] = useState<Split[] | null>([]);
  const [claimableSplits, setClaimableSplits] = useState<Recipient[] | null>([]);

  useEffect(() => {
    async function getAllSplits() {
      if (address) {
        setOwnedSplits(await getOwnedSplits(address));
        setClaimableSplits(await getClaimableSplits(address));
      }
    }

    getAllSplits().then(
      () => {},
      () => {}
    );
  }, [address]);

  // selected split
  const [selectedSplit, setSelectedSplit] = useState<Split | null>();
  const [creations, setCreations] = useState<Split | null>();
  const [editions, setEditions] = useState<Split | null>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [userSplitInfo, setUserSplitInfo] = useState<Recipient | null>();

  useEffect(() => {
    setIsOwner(false);
    selectedSplit?.recipients.forEach((recipient) => {
      if (recipient.user.id === address?.toLowerCase()) setUserSplitInfo(recipient);
    });
    selectedSplit?.owners.forEach((owner) => {
      if (owner.id === address?.toLowerCase()) setIsOwner(true);
    });
  }, [selectedSplit, address]);

  useEffect(() => {
    async function getAllPosts() {
      const Editions: (NFTCard | null)[] = [];
      await Promise.all(
        (selectedSplit as Split).editions.map(async (edition) => {
          const post = await getPostByEditionAddress(edition.id);
          Editions.push(post);
        })
      );
      setEditions(Editions);

      const Creations: (NFTCard | null)[] = [];
      await Promise.all(
        (selectedSplit as Split).creations.map(async (creation) => {
          const post = await getPostByID(Number(creation.id));
          Creations.push(post);
        })
      );
      setCreations(Creations);
    }

    getAllPosts().then(
      () => {},
      () => {}
    );
  }, [selectedSplit]);

  const clickClaim = async () => {
    await claimFunds({
      signer,
      address,
      splits: selectedSplit.recipients,
      needsIncremented: selectedSplit.needsIncremented,
      proxyAddress: selectedSplit.id,
    });
  };

  return {
    ownedSplits,
    claimableSplits,
    selectedSplit,
    setSelectedSplit,
    userSplitInfo,
    isOwner,
    creations,
    editions,
    clickClaim,
  };
};

export default useSplits;
