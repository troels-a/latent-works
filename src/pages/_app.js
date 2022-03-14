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
  }

  p {
    margin: 0 0 20px 0;
  }

  a {
    color: inherit;
    &:hover {
      text-decoration: none;
    }
  }


  input[type="text"], input[type="number"], input[type="password"], input[type="email"]{

    border: 0px solid ${theme.colors.text};
    border-bottom-width: 2px;
    background-color: transparent;
    font-family: ${theme.font};
    font-size: inherit;
    padding: 1vw 2vw;
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
    background-color: ${theme.colors.emph2};
    padding: 1vw 2vw;
    cursor: pointer;
    ${breakpoint('sm', 'md')`
      padding: 2vw 3vw;
    `}
    border: none;
    /* box-shadow: 0px 0px 20px rgba(0,0,0,0.1); */
    color: ${theme.colors.text};
    font-family: ${theme.font};
    font-size: inherit;
    &:hover {
      background-color: ${theme.colors.emph1};
    }
    &:active {
      background-color: ${theme.colors.emph3};
      /* box-shadow: 0px 0px 10px rgba(0,0,0,0.1); */
    }
    margin-right: 2vw;
    &:last-child {
      margin-right: 0;
    }
  }

`


export default function App({ Component, pageProps }) {

  return (
        <ErrorProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <EthNetProvider chainID={process.env.NEXT_PUBLIC_NETWORK}>
              <ThemeProvider theme={theme}>
                <ErrorMessage/>
                <GlobalStyle />
                <Component {...pageProps} />
              </ThemeProvider>
            </EthNetProvider>
        </Web3ReactProvider>
       </ErrorProvider>
  )

}
