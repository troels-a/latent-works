import styled from 'styled-components';
import {truncate} from 'base/utils';
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from '@web3-react/core'
import { useState } from 'react';

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });
export const wcConnector = new WalletConnectConnector({
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
});


const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 1rem;
  position: relative;
`

const ConnectGroup = styled.div`
  transition: opacity 500ms ease-out, transform 150ms ease-out;
  position: absolute;
  top: -0.6em;
  right: 0;
  ${p => !p.$show && `
    transition: opacity 150ms ease-out, transform 500ms ease-out;

    transform: translate(100%);
    opacity: 0;
    pointer-events: none;
  `}
`

const Connect = styled.a`
  cursor: pointer;
  margin-right: 2vw;
  &:last-child {
    margin-right: 0;
  }
`

export default function ConnectButton({onActivate }) {
  
  const {activate, active, deactivate} = useWeb3React();
  const [wantToConnect, setWantToConnect] = useState(false);
  
  return (
    <Wrapper>

      <ConnectGroup $show={!wantToConnect && active}>
        <Connect onClick={deactivate}>
          Disconnect
        </Connect>
      </ConnectGroup>

      <ConnectGroup $show={!wantToConnect && !active}>
        <Connect onClick={() => setWantToConnect(true)}>
          Connect
        </Connect>
      </ConnectGroup>

      <ConnectGroup $show={wantToConnect}>
        <Connect
        onClick={() => {
          if(onActivate)
            onActivate()
          activate(injected);
          setWantToConnect(false)
        }}
      >
        <span>Metamask</span>
        </Connect>

        <Connect
        onClick={() => {
          if(onActivate)
            onActivate()
          activate(wcConnector);
          setWantToConnect(false)
        }}
      >
        <span>Walletconnect</span>
        </Connect>
      </ConnectGroup>

    </Wrapper>
    );
  }
  