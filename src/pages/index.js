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
import abi from 'base/abi.json';
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

        {/* {chainId != 1 && <h2>!!!TESTNET!!!</h2>} */}

        <Section>
            <Works/>
        </Section>
    
        <Section>
            <ConnectButton activate={activate} onActivate={() => setWorking(true)}/>
        </Section>
        
        {active && <>
            <Section>
            {(props.editions[editions]) && <h3>
                Edition {editions+1} is released {moment(props.editions[editions]).fromNow()} ({moment(props.editions[editions]).calendar()})
            </h3>}
            </Section>
            <Mint>
            {(available > 0) && <div>
                <Section>{minted} of {editions*77} available work editions minted. {(currentEdition > 0) && `Currently minting edition ${currentEdition}.`}</Section>
                <button onClick={mint}>Mint (0.07 ETH)</button>
            </div>}

            {(available < 1 && editions > 0 && editions < 7) && <div>
                All available works have been minted. Please wait for the next edition to be released {moment(props.editions[editions]).fromNow()}
            </div>}

            {(available < 1 && editions < 1) && <div>
                When the first edition has been released, this is where you'll find the mint button.           
            </div>}

            </Mint>
        </>}   
        <Section dangerouslySetInnerHTML={{__html: props.content}}/>

    </Page>
    
}


export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', 'index');
    
    return {
        props: content
    }
}