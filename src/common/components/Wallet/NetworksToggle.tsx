/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @next/next/no-img-element */
import React, { memo, useCallback, useMemo, useState } from "react";
import NetworksModal from "./NetworksModal";
import { allNetworks } from "./networks";

// eslint-disable-next-line react/display-name
const NetworksToggle = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const currentNetwork = useMemo(
    () => allNetworks.find((network) => network.id === window.NEXT_PUBLIC_TARGET_NETWORK_ID),
    []
  );

  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleOpen = useCallback(() => setIsOpen(true), [setIsOpen]);

  return (
    <>
      <div className={classes.container} onClick={handleOpen}>
        <img
          className={classes.logo}
          src={getSingleAssetSrc(currentNetwork.asset)}
          alt={`${currentNetwork.asset} logo`}
        />
        <div className={classes.tag}>
          <div className={classes.connected} />
          <p className={classes.networkName}>{currentNetwork.name}</p>
        </div>
      </div>
      <NetworksModal isOpen={isOpen} handleClose={handleClose} currentNetwork={currentNetwork} />
    </>
  );
});

export default NetworksToggle;
