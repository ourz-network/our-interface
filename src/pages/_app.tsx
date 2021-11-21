/* eslint-disable react/jsx-props-no-spreading */

import "../styles/globals.css";
import { AppProps } from "next/dist/shared/lib/router/router";
import GlobalProvider from "@/app/index";
import web3 from "@/app/web3";
import ZoraWrapper from "@/common/components/NftCards/ZoraWrapper";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <GlobalProvider>
      <ZoraWrapper>
        <Component {...pageProps} />
      </ZoraWrapper>
    </GlobalProvider>
  );
}

export default MyApp;
