import Page from "templates/Page"



import Grid from "styled-components-grid"
import Section from "components/Section/Section";
import use77x7, {_77x7Provider} from "hooks/use77x7";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { map } from "lodash";
import useWork, { WorkProvider } from "hooks/useWork";
import styled, { css, keyframes } from "styled-components";
import use00x0, { _00x0Provider } from "hooks/use00x0";
import { AspectRatio } from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import { getEntryBySlug } from "base/contentAPI";
import { useConnectIntent } from "components/ConnectButton";
import { ethers } from "ethers";
import useError from "hooks/useError";
import { Swiper, SwiperSlide } from 'swiper/react';
import {breakpoint} from "styled-components-breakpoint";

// Import Swiper styles
import 'swiper/css';

const Works = styled(p => <Grid container {...p}/>)`
    width: calc(100%+1vw);
    margin-left: -0.5vw;
`;

const colorPulse = keyframes`
    0% {
        background-color: rgba(255,255,255,0.05);
    }
    50% {
        background-color: rgba(255,255,255,0.1);
    }
    100% {
        background-color: rgba(255,255,255,0.05);
    }
`

const Work = styled(({children, ...p}) => <Grid.Unit {...p} size={1/3}><AspectRatio style={{width: '100%'}} ratio="1/1">{children}</AspectRatio></Grid.Unit>)`

    padding: 0 .5vw 1vw .5vw;
    position: relative;

    ${p => p.index > 0 && `

    &:before {
        content: "${p.index}";
        color: black;
        display: inline-block;
        position: absolute;
        top: 0;
        padding: 1px 2px;
        background-color: white;
        z-index: 2;
    }

    `}

    > * {
        ${p => !p.loaded && css`animation: ${colorPulse} 2s infinite;`}
    }

`


const MintingSection = styled(Section)`
    
    ${p => p.disabled && `
        opacity: 0.2;
        pointer-events: none;
    `}
`

const Center = styled.div`
    text-align: center;
`

const Button = styled.button`
    
    ${breakpoint('sm', 'md')`
        width: 100%;
    `}
`

function SelectableWork(p){

    const work = useWork();
    const [loaded, setLoaded] = useState(false);
    
    return <Work {...p} loaded={loaded}>
        {work && <img onLoad={() => setLoaded(true)} style={{height: 'auto', maxWidth: '100%'}} key={work.id} src={work.iterations[6]}/>}
    </Work>

}


function _00x0_transfer(props){

    const {account} = useWeb3React();
    const {balance, fetchBalance, fetchingBalance} = use77x7();
    const _77x7 = use77x7();
    const _00x0 = use00x0();
    const [selectedWorks, setSelectedWorks] = useState([]);
    const {connectIntent, setConnectIntent} = useConnectIntent();
    const [migrating, setMigrating] = useState(false);
    const err = useError();

    async function handleMigrate(works){
        
        setMigrating(true);
        works = works.map(id => parseInt(id));
        const values = Array(works.length).fill(1);
        const from = account;
        const to = _00x0.contract.address;
        try {
            const tx = await _77x7.contract.safeBatchTransferFrom(from, to, works, values, [])
            const receipt = await tx.wait();
            setMigrating(false);
            fetchBalance(account);
            setSelectedWorks(prev => [])
        }
        catch(e){
            err.setMessage(e.message)
            setMigrating(false);
        }
        
    }


    async function handleMint(comp){
        _00x0.contract.mint(comp.id, {value: comp.price});
    }


    return <Page>
        <Grid>
            <Grid.Unit size={{sm: 1/1, md: 7/12}}>
                <MintingSection disabled={migrating}>
                    
                    {!account && <Center><a href="#" onClick={(e) => {
                        e.preventDefault(); setConnectIntent(true)
                    }}>Connect</a></Center>}
                    {(fetchingBalance) && <div>Looking for 77x7 works...</div>}
                    {(account && !fetchingBalance && !balance) && <div>No 77x7 works found</div>}
                    {(balance && !fetchingBalance) && <Works>
                        {map(balance, (_bal, _id) => {
                        
                        return <WorkProvider workID={_id}>
                            <SelectableWork selected={selectedWorks.includes(_id)} index={selectedWorks.indexOf(_id)+1} onClick={() => setSelectedWorks(prev => {

                                const index = prev.indexOf(_id);

                                if(index > -1)
                                    delete prev[index];
                                else
                                    prev.push(_id);

                                return prev.filter(val => val);
                                    
                            })}/>
                        </WorkProvider>

                        })}
                    </Works>
                    }
                {(account && !fetchingBalance && balance && Object.entries(balance).length > 0) && 
                    <Section style={{paddingLeft: 0, paddingRight: 0}}>
                        <Button disabled={!(selectedWorks.length > 1 && selectedWorks.length < 8)} onClick={() => handleMigrate(selectedWorks)}>
                            {selectedWorks.length == 0 && `Select works to migrate`}
                            {selectedWorks.length == 1 && `Migrate`}
                            {(selectedWorks.length > 1 && selectedWorks.length < 8) && 'Migrate and create 00x0'}
                        </Button>
                    </Section>}
                </MintingSection>
            </Grid.Unit>
            <Grid.Unit size={{sm: 1/1, md: 5/12}}>
                <Section dangerouslySetInnerHTML={{__html: props.page00x0.content}}/>
                <Section padTop={false}>
                <a href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_ADDRESS_00X0}`}>
                    Contract
                </a>
                </Section>
            </Grid.Unit>
        </Grid>
    </Page>

}

function _00x0(p){
    return <_77x7Provider><_00x0Provider><_00x0_transfer {...p}/></_00x0Provider></_77x7Provider>;
}


export async function getStaticProps(){
    
    const page00x0 = await getEntryBySlug('pages', '00x0');

    return {
        props: {
            page00x0: page00x0,
        }
    }
}

export default _00x0;