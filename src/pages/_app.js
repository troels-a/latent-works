import { createGlobalStyle, ThemeProvider } from 'styled-components'
import {breakpoint} from 'styled-components-breakpoint';
import theme from 'base/style';
import { UseWalletProvider } from 'use-wallet'


const GlobalStyle = createGlobalStyle`
    
  body {

    font-family: 'Xanh Mono', monospace;
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

`


export default function App({ Component, pageProps }) {

  return (
      <UseWalletProvider
        chainId={parseInt(process.env.NEXT_PUBLIC_NETWORK_ID)}
        connectors={{
          walletconnect:{
            rpcUrl: process.env.NEXT_PUBLIC_NETWORK_ENDPOINT
          }
        }}
      >
        
        <ThemeProvider theme={theme}>
          <GlobalStyle />
            <Component {...pageProps} />
        </ThemeProvider>

      </UseWalletProvider>

  )
}
