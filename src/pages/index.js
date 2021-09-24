import ConnectButton from 'components/ConnectButton';
import styled from 'styled-components';
import Page from 'templates/Page';
import Link from 'next/link';
import {useWallet} from 'use-wallet';
import { getEntryBySlug } from 'base/contentAPI';
import Works from 'components/Works/Works';

const Mint = styled.div`


`

const Section = styled.div`
    margin-bottom: 2vw;
    
`

export default function Home({content, ...props}){

    const {status} = useWallet();

    return <Page>

        <Section dangerouslySetInnerHTML={{__html: content}}/>
        <Works/>
        <small>Test visualization</small>

    </Page>

}


export async function getStaticProps(){

    const content = await getEntryBySlug('pages', 'index');

    return {
        props: content
    }
}