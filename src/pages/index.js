import ConnectButton from 'components/ConnectButton';
import styled from 'styled-components';
import Page from 'templates/Page';
import Link from 'next/link';
import {useWallet} from 'use-wallet';

const Mint = styled.div`



`

const Section = styled.div`
    margin-bottom: 2vw;
`

export default function Home(){

    const {status} = useWallet();

    return <Page>

        <Section>
            Latent Works is a series of 77*7 <em>extremely</em> on-chain SVG artworks that change with the number of owners. Every token has 7 editions available and each mint advances the output towards its final state.
        </Section>

        <Section>
            <ConnectButton/>
            {(status == 'connected') && <Mint>
                Hello minting section    
            </Mint>}
        </Section>


    </Page>

}