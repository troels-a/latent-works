import styled from 'styled-components';
import {chainToName, truncate} from 'base/utils';
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react';
import {breakpoint} from 'styled-components-breakpoint';
import { debounce } from 'lodash';
import useError from 'hooks/useError';
import { ethers } from 'ethers';
import useENS from 'hooks/useENS';
import useEthNet from 'hooks/useEthNet';

export const injected = new InjectedConnector({ supportedChainIds: [1, 4, 31337]});
export const wcConnector = new WalletConnectConnector({
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
});


const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 1em;
  position: relative;
`

const ConnectGroup = styled.div`

  transition: opacity 500ms ease-out, transform 150ms ease-out;
  position: absolute;
  top: -0.6em;
  right: 0;
  opacity: 1;
  text-align: right;
  
  ${p => !p.$show && `
    transition: opacity 150ms ease-out, transform 500ms ease-out;
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
  `}

  ${breakpoint('sm', 'lg')`

    ${p => p.choices && `
      position: fixed!important;
      z-index: 1001!important;
      top: 0!important;
      bottom: 0!important;
      left: 0!important;
      right: 0!important;
      width: 100vw;
      height: 100vh;
      background-color: ${p.theme.colors.bg};
      font-size: 3em;
      display: flex;
      text-align: center;
      place-items: center;
      place-content: center;
      flex-direction: column;
    `}
  `}

`

const Connect = styled.a`

  cursor: pointer;
  margin-right: 2vw;
  white-space: pre;

  &:last-child {
    margin-right: 0;
  }

  ${breakpoint('sm', 'md')`
    margin-right: 4vw;
  `}

`

function createConnectIntent(){

  const [connectIntent, setConnectIntent] = useState(false);
  let timeout = false;

  useEffect(() => {
    if(connectIntent){
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setConnectIntent(false);
      }, 10000);
    }
  }, [connectIntent])

  return {connectIntent, setConnectIntent};

}

const ConnectCtx = React.createContext();

export const ConnectIntent = ({children, ...props}) => {
  const intent = createConnectIntent();
  return <ConnectCtx.Provider value={intent}>{children}</ConnectCtx.Provider>
};


export function useConnectIntent() {
  const context = React.useContext(ConnectCtx)
  if (context === undefined) {
      throw new Error('useConnectIntent must be used within a ConnectIntent')
  }
  return context
}

export default function ConnectButton({onActivate}) {
  
  const {activate, active, deactivate, account, library, chainId} = useWeb3React();
  const {connectIntent, setConnectIntent} = useConnectIntent();
  const err = useError();
  const net = useEthNet();

  const {ENS, address, resolving, resolve} = useENS();

  useEffect(() => {
    if(account){
      resolve(account, library ? library : false);
    }
  }, [account])

  useEffect(() => {
    console.log()
  }, [connectIntent])

  return (
    <Wrapper>
      
      <ConnectGroup $show={!connectIntent && !active}>
        <Connect onClick={() => setConnectIntent(true)}>
          Connect
        </Connect>
      </ConnectGroup>

      <ConnectGroup $show={!connectIntent && active}>
        <Connect onClick={deactivate}>
          Disconnect <small>({ENS && ENS}{(!ENS && account) && (truncate(account, 6, '...')+account.slice(-4))})</small>
        </Connect>
      </ConnectGroup>

      <ConnectGroup choices $show={connectIntent}>
        <Connect
          onClick={() => {
            if(onActivate)
              onActivate()
            activate(injected);
            setConnectIntent(false)
          }}
        >
          <span>Metamask</span>
        </Connect>

        <Connect
          onClick={() => {
            if(onActivate)
              onActivate()
            activate(wcConnector);
            setConnectIntent(false)
          }}
        >
        <span>Walletconnect</span>
        </Connect>
      </ConnectGroup>

    </Wrapper>
    );
  }
  