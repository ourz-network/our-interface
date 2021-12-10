import { useRouter } from "next/router";
import web3 from "@/app/web3";

const WrongNetworkAlert = () => {
  const router = useRouter();
  const networkId = Number(router.query.networkId);
  const { network } = web3.useContainer();

  return (
    <p className="px-4 py-2 mx-auto mt-16 border animate-pulse border-dark-border text-dark-primary">
      Loading... Please connect your wallet
      {network && `to Chain #${networkId}. You are currently on chain #${network.chainId}.`}
    </p>
  );
};

export default WrongNetworkAlert;
