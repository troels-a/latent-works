import styled from 'styled-components'
import Head from 'next/head';
import Link from 'next/link'
import { TITLE, DESCRIPTION } from 'base/constants';
import Grid from 'styled-components-grid';
import ConnectButton from 'components/ConnectButton';
import {breakpoint} from 'styled-components-breakpoint';
import { useWeb3React } from '@web3-react/core';
import useEthNet from 'hooks/useEthNet';
import { useEffect } from 'react';
import useError from 'hooks/useError';

const Wrapper = styled.div`

  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;

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
  ${p => p.fixHeader && 'position: fixed; z-index: 100; top: 0; left: 0; right: 0;'}
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



export default function Page({children, $centerContent, ...props}){
    
  const {isChainID, switchNet} = useEthNet();
  const {active, chainId, deactivate} = useWeb3React();
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

    return <>
    
      <Head>
        <title>{TITLE}{props.title && ` >> ${props.title}`}</title> 
        <meta name="description" content={props.description ? props.description : DESCRIPTION}/>
      </Head>
        <Wrapper bgColor={props.bgColor}>

          <Header fixHeader={props.fixHeader}>
            
            <Grid.Unit component={Title} size={{sm: 1/2}}>
              <Link href="/">
                <a>
                  Latent Works
                </a>
              </Link>
            </Grid.Unit>
            
            <Grid.Unit size={{sm: 1/2}}>
              <ConnectButton/>
            </Grid.Unit>

          </Header>
          
          <Content $centerContent={$centerContent}>
          {children}
          </Content>

        </Wrapper>
    </>

}