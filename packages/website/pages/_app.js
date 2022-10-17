import { createGlobalStyle, ThemeProvider } from 'styled-components'
import {breakpoint} from 'styled-components-breakpoint';
import theme from 'base/style';
import Web3, { utils } from "web3";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { getProvider } from 'base/utils';
import { ErrorProvider } from 'hooks/useError';
import ErrorMessage from 'components/ErrorMessage/ErrorMessage';
import {ethers} from 'ethers';
import { EthNetProvider } from 'hooks/useEthNet';
import { IconContext } from "react-icons";
import { ConnectIntent } from 'components/ConnectButton';
import { LTNTProvider } from 'components/LTNT/Provider';

function getLibrary(provider){
  return new ethers.providers.Web3Provider(provider);
}


const GlobalStyle = createGlobalStyle`
    
  body {

    font-family: ${theme.font};
    font-size: 4vw;
    letter-spacing: 0.06em;
    background-color: ${p => p.theme.colors.bg};
    color: ${theme.colors.text};
    margin: 0;
    padding: 0;
    display: flex;
    width: 100%;
    height: 100vh;
    > div {
      width: 100%;
    }
    ${breakpoint('md')`
      font-size: 1.6vw;
    `}

    ${breakpoint('lg')`
      font-size: 1.4vw;
    `}
  }

  h1, h2, h3, h4, h5 {
    margin-top: 0;
    font-weight: normal;
    letter-spacing: 0.06em;
    font-style: italic;
    margin-bottom: 0.1em;
  }

  p {
    margin: 0 0 20px 0;
    font-size: inherit;
  }

  a {
    color: inherit;
    &:hover {
      text-decoration: none;
    }
  }


  input[type="text"], input[type="number"], input[type="password"], input[type="email"]{
    color: ${theme.colors.text};
    border: none;
    background-color: ${theme.colors.emph4};
    font-family: ${theme.font};
    font-size: inherit;
    padding: 1vw;
    ${breakpoint('sm', 'md')`
      padding: 2vw 3vw;
    `}
    border-radius: 0;

    &:focus {
      outline: 0;
    }

  }

  button {

    transition: all 150ms;
    background-color: ${theme.colors.emph7};
    padding: 1vw 2vw;
    cursor: pointer;

    ${breakpoint('sm', 'md')`
      padding: 2vw 3vw;
    `}

    border: none;
    

    color: ${theme.colors.text};
    font-family: ${theme.font};
    font-size: inherit!important;
    
    &:hover {
      background-color: ${theme.colors.emph9};
    }
    
    &:active {
      background-color: ${theme.colors.emph9};
      /* box-shadow: 0px 0px 10px rgba(0,0,0,0.1); */
    }
    &[disabled]{
      opacity: 0.3;
      pointer-events: none;
    }
    margin-right: 2vw;
    &:last-child {
      margin-right: 0;
    }
  }

  hr {
    width: 100%;
    border-color: ${theme.colors.emph3};
  }

  .icon {
    > * {
      stroke: ${theme.colors.main}!important;
    }
  }

`


export default function App({ Component, pageProps }) {

  return (
        <ErrorProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <EthNetProvider chainID={process.env.NEXT_PUBLIC_NETWORK}>
                <LTNTProvider>
                    <ThemeProvider theme={theme}>
                        <IconContext.Provider value={{color: theme.colors.main, className: 'icon'}}>
                        <ConnectIntent>
                        <ErrorMessage/>
                        <GlobalStyle />
                        <Component {...pageProps} />
                        </ConnectIntent>
                        </IconContext.Provider>
                    </ThemeProvider>
                </LTNTProvider>
            </EthNetProvider>
        </Web3ReactProvider>
       </ErrorProvider>
  )

}
