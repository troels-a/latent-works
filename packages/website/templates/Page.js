import styled, { useTheme } from 'styled-components'
import Head from 'next/head';
import Link from 'next/link'
import { TITLE, DESCRIPTION } from 'base/constants';
import Grid from 'styled-components-grid';
import ConnectButton from 'components/ConnectButton';
import {breakpoint} from 'styled-components-breakpoint';
import { useWeb3React } from '@web3-react/core';
import useEthNet from 'hooks/useEthNet';
import { useEffect, useState } from 'react';
import useError from 'hooks/useError';
import Balance from 'components/LTNT/Balance';
import Picker from 'components/LTNT/Picker';
import Button from 'components/Button';
import { useLTNT } from 'components/LTNT/Provider';
import { IconContext } from "react-icons";
import ErrorMessage from 'components/ErrorMessage/ErrorMessage';
import { createGlobalStyle, ThemeProvider } from 'styled-components'

import themes from 'base/themes';

const GlobalStyle = createGlobalStyle`
    
  body {

    font-family: ${p => p.theme.font};
    font-size: 4vw;
    letter-spacing: 0.06em;
    background-color: ${p => p.theme.colors.bg};
    transition: background-color 0.5s ease;
    color: ${p => p.theme.colors.text};
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
    color: ${p => p.theme.colors.text};
    border: none;
    background-color: ${p => p.theme.colors.emph4};
    font-family: ${p => p.theme.font};
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
    background-color: ${p => p.theme.colors.emph7};
    padding: 1vw 2vw;
    cursor: pointer;

    ${breakpoint('sm', 'md')`
      padding: 2vw 3vw;
    `}

    border: none;
    

    color: ${p => p.theme.colors.text};
    font-family: ${p => p.theme.font};
    font-size: inherit!important;
    
    &:hover {
      background-color: ${p => p.theme.colors.emph9};
    }
    
    &:active {
      background-color: ${p => p.theme.colors.emph9};
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
    border-color: ${p => p.theme.colors.emph3};
  }

  .icon {
    > * {
      stroke: ${p => p.theme.colors.main}!important;
    }
  }

`


const Wrapper = styled.div`

  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: top;
  position: relative;

    ${p => p.bgImage && `
        background-image: url(${p.bgImage});
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        background-repeat: no-repeat;
    `}

    ${p => p.bgColor && `
        background-color: ${p.bgColor};
    `}

    ${p => p.txtColor && `
        color: ${p.txtColor};
    `}

  &:before {
    content: '';
    display: block;
    width: 100%;
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    opacity: 0;
    transition: all 2500ms;

  }

  ${breakpoint('lg')`
    text-align: left;
    margin: 0 auto;
  `}

`

const Header = styled(Grid)`
  padding: 0;
  padding: 2vw 2vw;
  ${breakpoint('sm', 'md')`
    padding: 2vw 4vw;
  `}
  height: auto;
  place-items: center;
  ${p => p.fixheader && 'position: fixed; z-index: 100; top: 0; left: 0; right: 0;'}
`

const Content = styled.main`
${p => p.$centerContent && `
  display: flex;
  flex-direction: column;
  place-content: center;
  place-items: center;
  min-height: 70vh;
`}
${breakpoint('sm', 'md')`
  font-size: 1.2rem;
`}
`

const Title = styled.h1`
  margin: 0;
  position: relative;
  left: -3px;
  font-size: 1em;
  font-style: italic;
  a {
    text-decoration: none;
  }
`


const Footer = styled.footer`
  display: flex;
  flex-grow: 1;
  background-color: ${p => p.theme.colors.emph3};
  padding: 2vw 4vw;
`

const Flex = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`


const LTNTBalance = styled.div`
  display: inline-block;
  cursor: pointer;
`



function _Page({children, $centerContent, ...props}){

    const {balance, tokens, picked, isPicking, setIsPicking} = useLTNT();
    const {isChainID, switchNet} = useEthNet();
    const {active, account, chainId, deactivate} = useWeb3React();
    const err = useError();
    function check(){
        if(active && !isChainID()){
        err.send(() => {
            return <span>You are connected to the wrong network. Please switch before continuing.</span>
        });
        err.setActions([{label: 'Switch network', callback: () => {switchNet(); err.reset()}}, {label: 'Cancel', callback: err.reset}]);
        deactivate();
        }
    }
    useEffect(() => {
        check()
    }, [active, chainId])


    const theme = useTheme()

    return <>
    
      <Head>
        <title>{TITLE}{props.title && ` >> ${props.title}`}</title> 
        <meta name="description" content={props.description ? props.description : DESCRIPTION}/>
      </Head>

            <IconContext.Provider value={{color: theme.colors.main, className: 'icon'}}>

                <ErrorMessage/>
                <GlobalStyle />

                <Wrapper>

                <Header fixheader={props.fixheader}>
                    
                    <Grid.Unit component={Title} size={{sm: 2/3}}>
                    <Link href="/">
                        <a>
                        Latent Works
                        </a>
                    </Link>
                    </Grid.Unit>
                    
                    <Grid.Unit size={{sm: 1/3}}>
                        <ConnectButton beforeConnected={() => {
                            if(balance > 0){
                                return <span className='clickable'>
                                    <Picker/>
                                    <LTNTBalance onClick={() => setIsPicking(true)}>LTNT <small>{picked && `#${picked}`}</small></LTNTBalance>
                                    {` | `}
                            </span>
                            }
                            else {
                                return <></>
                            }
                        }}/>
                    </Grid.Unit>

                </Header>
                
                <Content $centerContent={$centerContent}>
                {children}
                </Content>

                </Wrapper>
            </IconContext.Provider>

    </>

}

export default function Page({theme, ...p}){
    return <ThemeProvider theme={themes[theme] ? themes[theme] : themes.light}>
        <_Page {...p}/>
    </ThemeProvider>
}