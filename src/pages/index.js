import ConnectButton from 'components/ConnectButton';
import styled from 'styled-components';
import Page from 'templates/Page';
import Link from 'next/link';
import {useWallet} from 'use-wallet';
import { getEntryBySlug } from 'base/contentAPI';
import Works from 'components/Works/Works';
import Web3, { utils } from "web3";
import { useWeb3React } from '@web3-react/core'
import { useState, useEffect} from 'react';
import abi from 'base/abi/77x7.json';
import moment from 'moment';

const Mint = styled.div`
    background-color: ${p => p.theme.colors.altBg};
    padding: 2vw;
    margin: 2vw 0;
    color: black;
`

const Section = styled.div`
margin-bottom: 2vw;

`

export default function Home(props){
    
    // const {status, provider, chainId, networkName} = useWallet();
    const { activate, active, account, library, chainId} = useWeb3React();
    
    const [working, setWorking] = useState(false);
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);
    const [available, setAvailable] = useState(0);
    const [minted, setMinted] = useState(0);
    const [editions, setEditions] = useState(0);
    const [currentEdition, setCurrentEdition] = useState(0);
    const [transactionHash, setTransactionHash] = useState(null);
    
    useEffect(() => {

        if (!library) return;
        
        const contract = new library.eth.Contract(abi, process.env.NEXT_PUBLIC_CONTRACT);
        setContract(contract);

        contract.methods
        .getEditions()
        .call()
        .then((res) => {
            setEditions(parseInt(res));
        }, handleError);
        
        setEditions(false);
        
        contract.methods
        .getAvailable()
        .call()
        .then((res) => {
            setAvailable(parseInt(res));
        }, handleError);
        
        setAvailable(false);

        contract.methods
        .getMinted()
        .call()
        .then((res) => {
            setMinted(parseInt(res));
        }, handleError);
        
        setMinted(false);

        contract.methods
        .getCurrentEdition()
        .call()
        .then((res) => {
            setCurrentEdition(parseInt(res));
        }, handleError);
        
        setCurrentEdition(false);
        
    }, [chainId]);
    
    function handleError(err) {
        console.error(err);
        setWorking(false);
        setError(err);
    }
    
    function mint() {
        
        setWorking(true);
        
        contract.methods
        .mint()
        .send({ from: account, value: utils.toWei("0.07", "ether") })
        .then((res) => {
            setWorking(false);
            setTransactionHash(res.transactionHash);
        }, handleError);
    }
    
    
    return <Page>

    <Section dangerouslySetInnerHTML={{__html: props.content}}/>
    <Section>
        <Works/>
    </Section>
    <Link href="/77x7" passHref>
        <a>Read more about 77x7 and browse the works here</a>
    </Link>

    </Page>
    
}


export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', 'index');
    
    return {
        props: content
    }
}