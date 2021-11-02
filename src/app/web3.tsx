import WalletConnectProvider from "@walletconnect/web3-provider"; // WalletConnectProvider (Web3Modal)
import { BigNumber, ethers, Signer } from "ethers"; // Ethers
import { useCallback, useEffect, useState } from "react"; // State management
import { createContainer } from "unstated-next"; // Unstated-next containerization
import Web3Modal from "web3modal"; // Web3Modal

// ====== Web3Modal Config ======
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      // bridge: "https://polygon.bridge.walletconnect.org",
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // Inject Infura
      rpc: {
        1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID as string}`,
        4: `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID as string}`,
      },
    },
  },
};

function useWeb3() {
  // ====== State ======
  const [modal, setModal] = useState<Web3Modal>(); // Web3Modal
  const [address, setAddress] = useState<string>(); // User's ETH address
  const [network, setNetwork] = useState<ethers.providers.Network>(); // Connected ChainID
  const [injectedProvider, setInjectedProvider] = useState<ethers.providers.Web3Provider>(); // Ethers Provider
  const [signer, setSigner] = useState<Signer>(); // User's Wallet Instance

  // ====== Setup Web3Modal on Page Load ======
  useEffect(() => {
    function setupWeb3Modal() {
      // Create new
      const web3Modal = new Web3Modal({
        // network: "rinkeby", // optional
        cacheProvider: true, // optional
        // theme:"dark", // optional. Change to "dark" for a dark theme.
        providerOptions,
      });
      // Save to state
      setModal(web3Modal);
    }

    setupWeb3Modal();
  }, []);

  // ====== Connect (get web3 Signer) ======
  const authenticate = async () => {
    // Initiate web3Modal
    const web3Provider: ethers.providers.ExternalProvider = await modal?.connect();

    // Generate ethers provider
    const provider = new ethers.providers.Web3Provider(web3Provider);
    setInjectedProvider(provider);

    // User Login
    const web3Signer = provider.getSigner();
    const signature = await web3Signer.signMessage(
      `Instead of remembering a password, \njust sign this message to verify your \naccount ownership.`
    );

    // Sign message to verify account ownership
    if (signature) {
      setSigner(web3Signer);

      const Address = await web3Signer.getAddress();
      setAddress(Address);

      // Detects Network ID from user wallet
      const Network = await provider.getNetwork();
      setNetwork(Network);
    }
  };

  // ====== Disconnect Wallet ======
  const disconnectWeb3 = useCallback(() => {
    modal?.clearCachedProvider();
    setInjectedProvider(undefined);
    setNetwork(undefined);
    setAddress(undefined);
    setSigner(undefined);
  }, [modal]);

  // ====== Event Subscription ======
  const loadWeb3Modal = useCallback(async () => {
    const provider: ethers.providers.ExternalProvider = await modal?.connect();

    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider?.on("chainChanged", (chainId: number) => {
      // chainId: '0x1' = mainnet, '0x4' = rinkeby, etc
      // must convert from BigNumber
      const Network = ethers.providers.getNetwork(
        Number(BigNumber.from(chainId.toString()).toString())
      );

      setNetwork(Network);

      // eslint-disable-next-line no-console
      console.log(
        `Detected Web3 Network Change...\nNow connected to ${Network?.name}, Chain #${Network?.chainId}`
      );
    });

    provider?.on("accountsChanged", (accounts: string[]) => {
      setAddress(accounts[0]);

      // eslint-disable-next-line no-console
      console.log(`Detected Web3 Account Change...\nNow connected to signer: ${accounts[0]}`);
    });

    provider?.on("disconnect", (error: { code: number; message: string }) => {
      disconnectWeb3();

      // eslint-disable-next-line no-console
      console.log(
        `Web3 Disconnected${
          error.message && error.code
            ? `\nError Message: Code #${error.code}\n${error.message}`
            : ""
        }`
      );
    });
  }, [disconnectWeb3, modal]);

  useEffect(() => {
    if (modal?.cachedProvider) {
      loadWeb3Modal().then(
        () => {},
        () => {}
      );
    }
  }, [loadWeb3Modal, modal?.cachedProvider]);

  useEffect(() => {
    setSigner(injectedProvider?.getSigner());
  }, [injectedProvider]);

  // ====== Sign Message Via Metamask ======
  const verifyAPIpost = async (message: string) => {
    const signature = await signer?.signMessage(
      `Please sign this message to verify your account ownership. \nMessage:\n${message}`
    );
    if (signature) {
      return true;
    }
    return false;
  };

  // On load events
  // useEffect(setupWeb3Modal, []);

  return {
    authenticate,
    network,
    verifyAPIpost,
    injectedProvider,
    address,
    signer,
    disconnectWeb3,
  };
}

// Create unstate-next container
const web3 = createContainer(useWeb3);
export default web3;
