import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import NewMintMultistepForm from "@/modules/Create/NewMintMultistepForm";
import { getSplitRecipients } from "@/modules/subgraphs/ourz/functions";

const MintNFTFromExistingSplit = () => {
  const [loading, setLoading] = useState(true); // Global loading state
  const { query } = useRouter();
  const { proxyAddress } = query;
  // console.log(`proxyAddress`, proxyAddress);
  const [splitRecipients, setSplitRecipients] = useState([]);

  useEffect(() => {
    async function collectSplitRecipients(address) {
      const recipients = await getSplitRecipients(address);
      if (recipients) {
        setSplitRecipients(recipients);
        // console.log(`Split Recipients:\n`, splitRecipients);
        setLoading(false);
      }
    }
    if (proxyAddress) {
      collectSplitRecipients(proxyAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proxyAddress]);

  return <NewMintMultistepForm proxyAddress={proxyAddress} splitRecipients={splitRecipients} />;
};

export default MintNFTFromExistingSplit;