import styled from 'styled-components';
import {truncate} from 'base/utils';
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useWeb3React } from '@web3-react/core'

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });
export const wcConnector = new WalletConnectConnector({
  infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
});

const Button = styled.button`
  font-family: inherit;
  border: 1px solid black;
  background-color: black;
  color: white;
  cursor: pointer;
  font-size: 1em;
  line-height: 1em;
  padding: 1vw;
`

const Connectors = styled.div`
  display: flex;
  justify-content: flex-end;
`


const ConnectorLogo = styled(({name, label, ...p}) => <Button {...p}>{label}</Button>)`

  display: inline-block;
  margin-right: 1vw;
  cursor: pointer;

  > img {
    -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
    filter: grayscale(100%);
    width: auto;
    height: 25px;
  }

  &:hover {
    > img {
      -webkit-filter: initial;/* Safari 6.0 - 9.0 */
      filter: initial;
    }
  }

`


const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 1rem;
`

const Logout = styled(p => <span {...p} title="Log out">×</span>)`
  font-size: 1.7em;
  cursor: pointer;
`



export default function ConnectButton({onActivate }) {
  const { activate, active, deactivate} = useWeb3React();

  return (
      <Wrapper>
        {active ?
          <button onClick={deactivate}>Disconnect</button>
        :
        <>
        {/* <button
          onClick={() => {
            if(onActivate)
              onActivate()
            activate(injected);
          }}
          >
          <span>Metamask</span>
        </button> */}
        <button
          onClick={() => {
            if(onActivate)
              onActivate()
            activate(wcConnector);
          }}
        >
          <span>Connect</span>
        </button>
        </>
        }
      </Wrapper>
  );
}
