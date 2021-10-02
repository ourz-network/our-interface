import { MediaConfiguration } from "@zoralabs/nft-components";
import { Networks, NFTFetchConfiguration } from "@zoralabs/nft-hooks";
import { FC } from "react";
import web3 from "@/app/web3";
import Web3ReactManager from "@/components/Web3ReactManager";
import { ThemeProvider } from "@/hooks/useDarkMode";

export default function GlobalProvider({ children }: { children: FC }): JSX.Element {
  return (
    <Web3ReactManager>
      <web3.Provider>
        <NFTFetchConfiguration networkId={Networks.RINKEBY}>
          <MediaConfiguration
            networkId="4"
            style={{
              theme: {
                borderStyle: "1px solid #4D4D4D", // dark-border
                defaultBorderRadius: 0,
                lineSpacing: 28,
                // headerFont: "color: #691900;",
                // titleFont: "color: #FF7246;", //dark-primary
                bodyFont: "color: #FFFFFF;", // dark-primary
                linkColor: "#FF7246", // ourange-300
                buttonColor: {
                  primaryBackground: "#FFF",
                  primaryText: "#000",
                  background: "#000",
                },
                previewCard: {
                  background: "#060606", // dark-background
                  height: "330px",
                  width: "330px",
                },
                // titleFont: {
                //   color: "#fff",
                // },
                // mediaContentFont: {
                //   color: "#fff",
                // },
              },
              // styles: {
              //   cardAuctionPricing: {
              //     display: "hidden",
              //   },
              //   cardItemInfo: {
              //     display: "hidden",
              //   },
              // },
            }}
          >
            <ThemeProvider>{children}</ThemeProvider>
          </MediaConfiguration>
        </NFTFetchConfiguration>
      </web3.Provider>
    </Web3ReactManager>
  );
}

export { web3 };
