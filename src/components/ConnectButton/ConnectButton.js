import styled from 'styled-components';
import {truncate} from 'base/utils';
import { useWallet } from 'use-wallet'


const connectors = [
  {
    name: 'walletconnect',
    id: 'walletconnect',
    label: 'WalletConnect'
  },
  {
    name: 'metamask',
    id: 'injected',
    label: 'Metamask'
  }
]


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

export const connect = (wallet, connector) => {
    const connected = (wallet.status === 'connected');
    wallet.connect(connector)
}


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
`

const Logout = styled(p => <span {...p} title="Log out">×</span>)`
  font-size: 1.7em;
  cursor: pointer;
`



export default function ConnectButton(){

    const wallet = useWallet();
    const connected = (wallet.status === 'connected');

    return <Wrapper>

      {!connected && <>
        {connectors.map(connector => <ConnectorLogo key={connector.id} name={connector.name} label={connector.label} onClick={() => connect(wallet, connector.id)}/>)}
      </>}
      
      {(connected && wallet.account) && <>
          <span>{truncate(wallet.account, 6, '')}</span> <Logout onClick={wallet.reset}/>
      </>}
      
      {/* {connector && && <Button href="#" onClick={() => {connect(wallet, connector)}}>{(connected && wallet.account) ? truncate(wallet.account, 10) : 'Connect'}</Button>} */}

    </Wrapper>


}