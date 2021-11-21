/* eslint-disable import/no-named-as-default */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable @next/next/no-img-element */ // next/image not necessary for upload flow

import React, { useCallback, useEffect, useState } from "react";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { useRouter } from "next/router";
import web3 from "@/app/web3";
import PageLayout from "@/components/Layout/PageLayout";
import { createZoraEdition, mintZora } from "@/ethereum/OurPylon";
import { SplitRecipient } from "@/utils/OurzSubgraph";

import { MintForm } from "@/utils/CreateModule";

// Steps 1-4:
import SelectMintKind from "./1SelectMintKind";
import MintUpload from "./2Upload";
import MintDetails from "./3Details";
import MintConfirm from "./4Confirm";
import useRecipients from "@/common/hooks/useRecipients";

/**
 * NewMintMultistepForm()
 * Maintains state while navigating through a multi-step form to mint an NFT.
 * There is likely a *much* better way to compartmentalize all these moving parts.
 * The basic gist of it is that this container keeps all form's info in state,
 * as well as the functions to modify it.
 * React-hook-form is a necessary evil for splits' dynamic fields, AFAIK.
 * So is repeatedly unshifting the user's somewhat-static split field.
 */

const NewMintMultistepForm = ({
  proxyAddress,
  splitRecipients,
}: {
  proxyAddress: string;
  splitRecipients: SplitRecipient[];
  // eslint-disable-next-line consistent-return
}): JSX.Element | undefined => {
  // const [loading, setLoading] = useState(false);
  const Router = useRouter();
  const { address, signer, network } = web3.useContainer(); // Global State
  const [currentStep, setCurrentStep] = useState(1);
  const [mintForm, setFormData] = useState<MintForm>({
    mintKind: "1/1",
    media: {
      file: null,
      preview: "",
      blob: "",
    },
    metadata: {
      name: "", // title
      description: "",
      split_recipients: splitRecipients,
      version: "Ourz20210928",
      mimeType: "",
    },
    creatorBidShare: 10,
    auctionInfo: {
      reservePrice: 1,
      duration: 1,
    },
  });

  const { firstSale, secondarySales } = useRecipients({
    recipients: splitRecipients,
    secondaryRoyalty: mintForm.creatorBidShare,
  });

  const next = () => {
    setCurrentStep(currentStep + 1);
  };
  const back = () => {
    setCurrentStep(currentStep - 1);
  };

  const setMintKind = (Kind: MintForm["mintKind"]) => {
    setFormData((prevState) => ({
      ...prevState,
      mintKind: Kind,
    }));
  };

  const setBidShare = (bidshare: number) => {
    setFormData((prevState) => ({
      ...prevState,
      creatorBidShare: bidshare,
    }));
  };

  const setPublicMint = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      metadata: {
        ...prevState.metadata,
        publicMint: event.target.checked,
      },
    }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      metadata: {
        ...prevState.metadata,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const setAuctionInfo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      auctionInfo: {
        ...prevState.auctionInfo,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const onSubmit = async () => {
    if (
      proxyAddress &&
      signer &&
      network?.chainId === (1 || 4 || 137) &&
      (mintForm.mintKind === "1/1" || mintForm.mintKind === "1/1 Auction")
    ) {
      // minting as Split Proxy by Owner
      const tokenId = await mintZora({
        signer,
        networkId: network.chainId,
        proxyAddress,
        mintForm,
      });
      if (tokenId) {
        Router.push(`/nft/${tokenId}`).then(
          () => {},
          () => {}
        );
        // setLoading(false);
      }
    } else if (
      proxyAddress &&
      signer &&
      // network?.chainId === (1 || 4 || 137) &&
      mintForm.mintKind === "Edition"
    ) {
      const editionAddress = await createZoraEdition({
        signer,
        networkId: network.chainId,
        proxyAddress,
        mintForm,
      });
      if (editionAddress) {
        Router.push(`/nft/edition/${editionAddress as string}`).then(
          () => {},
          () => {}
        );
      }
      /*
       * minting as connected web3Wallet
       * const tokenId = await mintNFTSolo(mintForm); // received as 'media';
       * if (tokenId) {
       *   Router.push(`/nft/${tokenId}`);
       *   setLoading(false);
       * }
       */
    }
  };
  /*
   * router.push(`/${address}/success`)
   * } catch (e) {
   * }
   */

  /**
   * react-dropzone
   * Handles upload of images and previews throughout the steps.
   *
   */
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const handleMedia = () => {
    setFormData((prevState) => ({
      ...prevState,
      media: {
        ...prevState.media,
        file: files[0],
        preview: files[0].preview,
      },
      metadata: {
        ...prevState.metadata,
        mimeType: files[0].type,
      },
    }));
  };
  /**
   * onDrop()
   * creates an instance of the file as a buffer, as well as
   * creating preview thumbnails for the rest of the upload process.
   * When a user drag'n'drops (or selects via explorer/finder prompt) a file,
   * the path to the file on the user's device is protected from the browser.
   * However, further access to the file is needed for Zora ZDK's sha256FromBuffer().
   * Reference: https://react-dropzone.js.org/ > Usage > the first 'Warning' header
   */
  const onDrop: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void = useCallback((dropzoneFiles) => {
    dropzoneFiles.forEach((file) => {
      // Takes the acceptedFile and reads it for uploading as a blob.
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        // Save the readFile to state under mediaBlob
        const arrayBuffer = reader.result;
        setFormData((prevState) => ({
          ...prevState,
          media: {
            ...prevState.media,
            blob: arrayBuffer,
          },
        }));
      };
    });

    // Preview Thumbnails
    setFiles(
      dropzoneFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: "image/*, video/*, audio/*, text/plain",
    onDrop,
  });

  // Mapping is not exactly necessary, only 1 file can be uploaded, but too lazy to rewrite.

  const thumbs = files.map((file): JSX.Element => {
    if (file.type.startsWith("image")) {
      return (
        <div className="box-border inline-flex p-2 my-auto" key={file.name}>
          <div className="flex object-contain overflow-hidden min-w-0 max-h-50vh">
            <img
              src={file.preview}
              className="object-contain w-full"
              alt="Preview of your upload"
            />
          </div>
        </div>
      );
    }
    if (file.type.startsWith("video")) {
      return (
        <div className="box-border inline-flex p-2 my-auto" key={file.name}>
          <div className="flex overflow-hidden min-w-0 h-96">
            <video autoPlay controls muted className="block w-auto h-full" playsInline>
              <source src={file.preview} />
            </video>
          </div>
        </div>
      );
    }
    return <></>;
  });

  useEffect(
    () => () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  // eslint-disable-next-line default-case
  switch (currentStep) {
    case 1:
      return (
        <PageLayout>
          <SelectMintKind mintForm={mintForm} setMintKind={setMintKind} next={next} />
        </PageLayout>
      );
    case 2:
      return (
        <PageLayout>
          <MintUpload
            handleMedia={handleMedia}
            acceptedFiles={acceptedFiles}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            thumbs={thumbs}
            next={next}
            back={back}
          />
        </PageLayout>
      );
    case 3:
      return (
        <PageLayout>
          <MintDetails
            mintForm={mintForm}
            handleChange={handleChange}
            setBidShare={setBidShare}
            setPublicMint={setPublicMint}
            thumbs={thumbs}
            next={next}
            back={back}
          />
        </PageLayout>
      );
    case 4:
      return (
        <PageLayout>
          <MintConfirm
            address={address as string}
            mintForm={mintForm}
            firstSale={firstSale}
            secondarySales={secondarySales}
            proxyAddress={proxyAddress}
            setMintKind={setMintKind}
            setAuctionInfo={setAuctionInfo}
            thumbs={thumbs}
            back={back}
            onSubmit={onSubmit}
          />
        </PageLayout>
      );
  }
};

export default NewMintMultistepForm;
