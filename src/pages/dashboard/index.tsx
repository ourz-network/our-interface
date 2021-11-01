import { useState } from "react"; // State management
import web3 from "@/app/web3";
import PageLayout from "@/components/Layout/PageLayout"; // Layout wrapper
import SplitThumb from "@/components/Dashboard/SplitThumb";
import SplitFull from "@/components/Dashboard/SplitFull";
import { Split } from "@/utils/OurzSubgraph";
import useSplits from "@/common/hooks/useSplits";
import WrongNetworkAlert from "@/components/Layout/WrongNetworkAlert";

const UserDashboard = (): JSX.Element => {
  const { address, network } = web3.useContainer();
  const {
    ownedSplits,
    claimableSplits,
    selectedSplit,
    setSelectedSplit,
    userSplitInfo,
    isOwner,
    creations,
    editions,
    clickClaim,
  } = useSplits({ address });

  const [showFull, setShowFull] = useState(false);

  const handleClickThumbnail = (split: Split) => {
    setSelectedSplit(split);
    setShowFull(true);
  };

  return (
    <PageLayout>
      <div className="flex w-full h-full min-h-screen">
        <div className="flex flex-col w-full min-h-screen h-min bg-dark-background">
          {showFull && (
            <SplitFull
              split={selectedSplit}
              userInfo={userSplitInfo}
              isOwner={isOwner}
              setShowFull={setShowFull}
              creations={creations}
              editions={editions}
              clickClaim={clickClaim}
            />
          )}

          {(!address || network?.name !== "homestead") && <WrongNetworkAlert />}
          {address && network?.name === "homestead" && (
            <>
              {ownedSplits?.length > 0 && !showFull && (
                <>
                  <h1 className="mx-auto mt-4 text-center text-dark-primary">
                    Splits you are a Whitelisted Minter for:
                  </h1>
                  <div className="grid auto-cols-auto auto-rows-auto gap-8 justify-center mx-auto mt-2 h-full min-w-screen">
                    {ownedSplits.map((split) => (
                      <SplitThumb
                        key={`own-${split.id}`}
                        ownedSplit={split}
                        userInfo={userSplitInfo}
                        handleClick={() => handleClickThumbnail(split)}
                      />
                    ))}
                  </div>
                </>
              )}
              {!ownedSplits && (
                <p className={`mx-auto text-center text-dark-primary ${showFull ? `hidden` : ""}`}>
                  You will need to create a new Split first. Click Create.
                </p>
              )}

              {claimableSplits?.length > 0 && !showFull && (
                <>
                  <h1 className="mx-auto mt-4 text-center text-dark-primary">
                    Splits you are able to claim:
                  </h1>
                  <div className="grid auto-cols-auto auto-rows-min gap-8 justify-center mx-auto mt-2 w-full h-full">
                    {claimableSplits.map((recipient) => (
                      <SplitThumb
                        key={`rec-${recipient.id}`}
                        claimableSplit={recipient}
                        userInfo={userSplitInfo}
                        handleClick={() => handleClickThumbnail(recipient.split)}
                      />
                    ))}
                  </div>
                </>
              )}
              {!claimableSplits && (
                <p className={`mx-auto text-center text-dark-primary ${showFull ? `hidden` : ""}`}>
                  You are not the recipient of any Splits.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default UserDashboard;
