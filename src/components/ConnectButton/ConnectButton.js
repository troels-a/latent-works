import styled from 'styled-components';
import {truncate} from 'base/utils';
import { useWeb3React } from '@web3-react/core'
import { wcConnector, injected } from 'pages/_app';


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
`

const Logout = styled(p => <span {...p} title="Log out">×</span>)`
  font-size: 1.7em;
  cursor: pointer;
`



export default function ConnectButton({ activate, onActivate }) {

  return (
      <Wrapper>
        <button
          onClick={() => {
            onActivate()
            activate(injected);
          }}
          >
          <span>Metamask</span>
        </button>
        <button
          onClick={() => {
            onActivate();
            activate(wcConnector);
          }}
        >
          <span>WalletConnect</span>
        </button>
      </Wrapper>
  );
}
