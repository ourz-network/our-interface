/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FieldValues, UseFieldArrayReturn, useFieldArray, useForm } from "react-hook-form";
import DetailedPie from "@/components/Charts/DetailedPie";
import web3 from "@/app/web3";
import { FormSplitRecipient } from "@/utils/CreateModule";
import { newProxy } from "@/modules/ethereum/OurPylon";

const NewSplit: React.FC = (): JSX.Element => {
  const Router = useRouter();
  const { address, signer, network } = web3.useContainer(); // Global State

  const [ownerData, setOwnerData] = useState({
    id: undefined,
    account: address,
    name: "",
    role: "",
    shares: 100,
  });

  const [nickname, setNickname] = useState<string | undefined>();

  const [chartData, setChartData] = useState([{ name: "Creator", shares: 100 }]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOwnerData({
      ...ownerData,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    if (!ownerData.account) {
      ownerData.account = address;
    }
  }, [address, ownerData]);

  /**
   *  react-hook-form
   *  Handles NewSplit.js' dynamic form fields (the "Add Another Split" button).
   *  A bit overkill for the rest of the form, but the easiest way to achieve
   *  live-updating fields & charts, AFAIK.
   */

  const { control, register, watch } = useForm({
    mode: "all",
  });
  // https://react-hook-form.com/api/usefieldarray/
  const { fields, append, remove }: UseFieldArrayReturn<FieldValues, "splits", "id"> =
    useFieldArray({
      control,
      name: "splits",
    });
  // Live updates for pie chart

  const watchSplits = watch("splits");

  const controlledFields: FormSplitRecipient[] = fields.map(
    (field: Record<"id", string | number>, index: number) => ({
      ...field,

      ...watchSplits[index],
    })
  );
  // on 'Add Another'
  const onAppend = () => {
    append({ account: "", name: "", role: "", shares: 0 });
    updateChart();
  };
  const calculateOwnerShares = () => {
    const totalSplits: number = controlledFields.reduce(
      (accumulator: number, index) => accumulator + Number(index.shares),
      0
    );
    ownerData.shares = 100 - totalSplits;
  };

  /**
   *  recharts
   *  Visualizes splits as pie charts.
   */
  // createSplit.js is passed this function as a prop and used for dynamic fields onBlur event.
  const updateChart = () => {
    calculateOwnerShares();

    const newChartData = controlledFields.flatMap((split) => ({
      name: `${split.name || split.account}`,
      shares: Number(split.shares),
    }));
    newChartData.unshift({
      name: `${ownerData.name.length > 0 ? ownerData.name : (ownerData.account as string)}`,
      shares: ownerData.shares,
    });
    setChartData(newChartData);
  };

  const onSubmit = async () => {
    const splitData = controlledFields;
    splitData.unshift(ownerData);
    const proxyAddress = await newProxy({
      signer,
      address,
      formData: controlledFields, // received as 'splitData'
      nickname, // received as 'splitData',
      networkId: network?.chainId,
    });

    if (proxyAddress) {
      Router.push(`/create/mint/${proxyAddress}`).then(
        () => {},
        () => {}
      );
    }
  };

  const submitSplits = async () => {
    /*
     * handleSplits();
     * const newProxy = await onSubmit();
     */
    await onSubmit();
  };

  return (
    <div className="flex flex-row content-center place-content-center w-full h-full bg-dark-background">
      <div className="flex flex-col px-4 py-4 mt-12 w-full h-auto" id="splits">
        <div className="flex justify-center w-full" id="graphs">
          <div className="flex flex-col justify-center w-1/2 text-center">
            <p className="font-semibold text-dark-primary">Splits</p>
            <p className="text-dark-secondary">
              Fill out the form below for everyone
              <br />
              that you would like to credit in your Split.
              <br />
              <br />
              Funds received by the contract, like NFT sales and royalties,
              <br />
              will be claimable by the Split Recipients, up to their allocated amount.
            </p>
          </div>
          <div className="z-0 mx-auto -my-32 w-full max-w-500px">
            <DetailedPie chartData={chartData || null} isSecondaryChart={false} />
          </div>
        </div>
        <form className="z-50 justify-center -mt-1 w-full text-center">
          <div className="flex flex-col justify-center">
            <p className="mx-auto text-dark-primary">Enter A Nickname For The Split:</p>
            <input
              type="text"
              id="splitNickname"
              name="nickname"
              className="mx-auto w-min text-dark-accent"
              placeholder="Anonymous"
              aria-label="Enter A Nickname For The Split"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-center w-full border-b">
            <ul className="flex flex-col mt-4 w-full">
              <li className="flex flex-nowrap justify-center mx-auto mb-3 space-x-3 w-full">
                <input
                  type="text"
                  id="ownerAddress"
                  name="address"
                  defaultValue={address}
                  placeholder="Please 'Connect Wallet' before continuing."
                  className="p-3 w-1/3 text-sm border shadow border-dark-border"
                  disabled
                />
                <input
                  type="text"
                  id="ownerName"
                  name="name"
                  defaultValue={ownerData.name}
                  placeholder="Your Name / Alias"
                  onBlur={updateChart}
                  onChange={handleChange}
                  className="p-3 w-1/4 text-sm border shadow border-dark-border min-w-1/4"
                />
                <input
                  type="text"
                  id="ownerRole"
                  name="role"
                  placeholder="Your Role / Description"
                  value={ownerData.role}
                  onChange={handleChange}
                  onBlur={updateChart}
                  className="p-3 w-1/4 text-sm border shadow border-dark-border min-w-1/4"
                />
                <input
                  type="number"
                  id="ownerShare"
                  name="shares"
                  value={ownerData.shares}
                  className="p-3 w-14 text-sm border shadow appearance-none border-dark-border"
                  disabled
                />
                <button
                  type="button"
                  onClick={onAppend}
                  className="px-5 py-3 w-auto whitespace-nowrap border shadow transition duration-200 text-dark-primary bg-dark-background hover:ring-4 hover:ring-yellow-500"
                >
                  Add Split
                </button>
              </li>
              {controlledFields.map((field, index) => (
                <li
                  key={index}
                  className="flex flex-nowrap justify-center pt-3 mx-auto mb-3 space-x-3 w-full border-t border-dark-border"
                >
                  <input
                    name={`splits.${index}.address`}
                    type="text"
                    placeholder="Ethereum Address 0x00..."
                    defaultValue={field.account}
                    {...register(`splits.${index}.account` as const, {
                      required: true,
                      validate: (value: string) => ethers.utils.isAddress(value) === true,
                    })}
                    onBlur={updateChart}
                    className="p-3 w-1/3 h-auto text-sm border shadow border-dark-border"
                  />
                  <input
                    name={`splits.${index}.name`}
                    type="text"
                    placeholder="Collaborator Name / Alias"
                    defaultValue={field.name}
                    {...register(`splits.${index}.name` as const)}
                    onBlur={updateChart}
                    className="p-3 w-auto text-sm border shadow border-dark-border min-w-1/4"
                  />
                  <input
                    name={`splits.${index}.role`}
                    type="text"
                    placeholder="Role / Description"
                    defaultValue={field.role}
                    {...register(`splits.${index}.role` as const)}
                    onBlur={updateChart}
                    className="p-3 w-auto text-sm border shadow border-dark-border min-w-1/4"
                  />
                  <input
                    name={`splits.${index}.shares`}
                    {...register(`splits.${index}.shares` as const, {
                      required: true,
                      min: 0,
                      max: 100,
                    })}
                    type="number"
                    defaultValue={field.shares}
                    placeholder="%"
                    className="p-3 w-14 text-sm border shadow appearance-none border-dark-border"
                    onBlur={updateChart}
                    // disabled={`index` ? 0 : "true"}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="px-6 py-3 text-white border shadow transition duration-200 bg-dark-background hover:ring-4 hover:ring-ourange-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </form>
        <div className="flex justify-center mt-5">
          <button
            className="p-3 border border-dark-border text-dark-primary mainButton"
            onClick={submitSplits}
            type="submit"
          >
            Create New Split Contract
          </button>
        </div>
        <p className="mt-3 text-center text-dark-secondary">
          *Note*: This transaction will only create the Split Contract that is able to mint NFTs.
          <br />
          You will still have to make a separate transaction after this, if you want to mint an NFT.
        </p>
      </div>
    </div>
  );
};

export default NewSplit;
