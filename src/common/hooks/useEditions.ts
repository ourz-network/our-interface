import { useState } from "react";
import { Signer } from "ethers";
import {
  setEditionPrice,
  withdrawEditionFunds,
  setApprovedMinter,
  mintEditionsToRecipients,
  purchaseEdition,
} from "@/modules/ethereum/OurPylon";
import { NFTCard } from "@/modules/subgraphs/utils";

interface SaleInfo {
  maxSupply: number;
  currentSupply: number;
  salePrice: number;
}

const useEditions = ({
  post,
  signer,
  saleInfo,
}: {
  post: NFTCard;
  signer: Signer | undefined;
  saleInfo: SaleInfo;
}) => {
  const [formData, setFormData] = useState({
    minterAddress: "0x0000000000000000000000000000000000000000",
    approved: false,
    mintTo: "",
    price: "0",
  });

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleMinter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleMintTo = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value.replace(/\s/g, ""),
    }));
  };

  const handlePrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const setSalePrice = async () => {
    const success = await setEditionPrice({
      signer: signer as Signer,
      proxyAddress: post.creator,
      editionAddress: post.editionAddress as string,
      salePrice: formData.price,
    });
    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR SETTING PRICE`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESSFULLY SET PRICE`);
  };

  const withdraw = async () => {
    const success = await withdrawEditionFunds({
      signer: signer as Signer,
      proxyAddress: post.creator,
      editionAddress: post.editionAddress as string,
    });
    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR WITHDRAWING FUNDS`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESSFULLY WITHDREW FUNDS`);
  };

  const setEditionMinter = async () => {
    const success = await setApprovedMinter({
      signer: signer as Signer,
      proxyAddress: post.creator,
      editionAddress: post.editionAddress as string,
      minterAddress: formData.minterAddress,
      approved: formData.approved,
    });
    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR SETTING MINTER`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESSFULLY SET MINTER`);
  };

  const mintEditions = async () => {
    const success = await mintEditionsToRecipients({
      signer: signer as Signer,
      proxyAddress: post.creator,
      editionAddress: post.editionAddress as string,
      recipients: formData.mintTo.split(","),
    });
    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR MINTING EDITIONS`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESSFULLY MINTED EDITIONS`);
  };

  const purchase = async () => {
    const success = await purchaseEdition({
      signer: signer as Signer,
      editionAddress: post.editionAddress as string,
      salePrice: saleInfo?.salePrice,
    });
    if (!success) {
      // eslint-disable-next-line no-console
      console.log(`ERROR PURCHASING EDITION`);
      // eslint-disable-next-line no-console
    } else console.log(`SUCCESSFULLY PURCHASED EDITION`);
  };

  return {
    formData,
    handleCheckbox,
    handleMinter,
    handleMintTo,
    handlePrice,
    setSalePrice,
    withdraw,
    setEditionMinter,
    mintEditions,
    purchase,
  };
};

export default useEditions;
