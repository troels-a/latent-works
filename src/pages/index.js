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
            Latent Works is a series of 77*7 <em>solidity generated</em> on-chain artworks that change with the number of mints. All 77 tokens have 7 possible editions and each mint of one advances the shared artwork through a series of predetermined iterations towards its final state.
        </Section>

        <Section>
            The project is based on the often overlooked ERC1155 standard proposed by by @enjin. being developed by @troels_a and will 
        </Section>


    </Page>

}