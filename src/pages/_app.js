import { createGlobalStyle, ThemeProvider } from 'styled-components'
import {breakpoint} from 'styled-components-breakpoint';
import theme from 'base/style';
import Web3, { utils } from "web3";
import { Web3ReactProvider, useWeb3React } from "@web3-react/core";


function getLibrary(provider){
  return new Web3(provider);
}


const GlobalStyle = createGlobalStyle`
    
  body {

    font-family: ${theme.font};
    font-size: 4vw;
    letter-spacing: 0.06em;
    background-color: ${theme.colors.bg};
    color: ${theme.colors.text};

    ${breakpoint('md')`
      font-size: 2.5vw;
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
    background-color: ${theme.colors.bg};
    padding: 1vw 2vw;
    ${breakpoint('sm', 'md')`
      padding: 2vw 3vw;
    `}
    border: 2px solid ${theme.colors.text};
    color: ${theme.colors.text};
    font-family: ${theme.font};
    font-size: inherit;
    box-shadow: 3px 3px 0px ${theme.colors.text};
    &:active {
      position: relative;   
      top: 2px;
      left: 2px;
      box-shadow: 1px 1px 0px ${theme.colors.text};
    }
    margin-right: 2vw;
    &:last-child {
      margin-right: 0;
    }
  }

`


export default function App({ Component, pageProps }) {

  return (
        <Web3ReactProvider getLibrary={getLibrary}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
            <Component {...pageProps} />
        </ThemeProvider>
       </Web3ReactProvider>
  )
}
