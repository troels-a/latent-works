
import Web3, { utils } from "web3";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { getProvider } from 'base/utils';
import { ErrorProvider } from 'hooks/useError';
import {ethers} from 'ethers';
import { EthNetProvider } from 'hooks/useEthNet';
import { ConnectIntent } from 'components/ConnectButton';
import { LTNTProvider } from 'components/LTNT/Provider';

function getLibrary(provider){
  return new ethers.providers.Web3Provider(provider);
}



export default function App({ Component, pageProps }) {

  return (
        <ErrorProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <EthNetProvider chainID={process.env.NEXT_PUBLIC_NETWORK}>
                <ConnectIntent>
                    <LTNTProvider>
                        <Component {...pageProps} />
                    </LTNTProvider>
                </ConnectIntent>
            </EthNetProvider>
        </Web3ReactProvider>
       </ErrorProvider>
  )

}
