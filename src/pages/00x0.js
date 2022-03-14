import Page from "templates/Page"
import Grid from "styled-components-grid"
import Section from "components/Section/Section";
import use77x7, {_77x7Provider} from "hooks/use77x7";
import { useWeb3React } from "@web3-react/core";
import { Children, useEffect, useState } from "react";
import { keys, keysIn, map, mapKeys, mapValues } from "lodash";
import useWork, { WorkProvider } from "hooks/useWork";
import { WorkImage } from "components/WorkDisplay/WorkDisplay";
import styled, { keyframes } from "styled-components";
import use00x0, { _00x0Provider } from "hooks/use00x0";
import { AspectRatio } from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import { getEntryBySlug } from "base/contentAPI";
import { useWantToConnect } from "components/ConnectButton/ConnectButton";
import { ethers } from "ethers";
import useError from "hooks/useError";

const Works = styled(p => <Grid container {...p}/>)`
    width: calc(100%+1vw);
    margin-left: -0.5vw;
`;

const colorPulse = keyframes`
    0% {
        background-color: rgba(0,0,0,0.05);
    }
    50% {
        background-color: rgba(0,0,0,0.1);
    }
    100% {
        background-color: rgba(0,0,0,0.05);
    }
`

const Work = styled(({children, ...p}) => <Grid.Unit {...p} size={1/3}><AspectRatio style={{width: '100%'}} ratio="1/1">{children}</AspectRatio></Grid.Unit>)`

    padding: 0 .5vw 1vw .5vw;
    position: relative;

    ${p => p.index > 0 && `

    &:before {
        content: "${p.index}";
        color: inherit;
        display: inline-block;
        position: absolute;
        top: 5px;
        padding: 1px 2px;
        background-color: white;
        z-index: 2;
    }

    `}

    > * {
        animation: ${colorPulse} 2s infinite;
        border: 5px solid transparent; box-sizing: border-box;
        ${p => p.selected && 'border-color: black;'}
    }

`


const MintingSection = styled(Section)`
    ${p => p.disabled && `
        opacity: 0.2;
    `}
`


const CompImage = styled.div`
    max-width: 30vw;
    margin: 5vw auto;
`

function SelectableWork(p){

    const work = useWork();
    
    return <Work {...p}>
        {work && <img style={{height: 'auto', maxWidth: '100%'}} key={work.id} src={work.iterations[6]}/>}
    </Work>

}


function ZeroZeroByZero(props){

    const {account} = useWeb3React();
    const {balance, fetchBalance, fetchingBalance} = use77x7();
    const _77x7 = use77x7();
    const _00x0 = use00x0();
    const [comps, setComps] = useState();
    const [selectedWorks, setSelectedWorks] = useState([]);
    const {wantToConnect, setWantToConnect} = useWantToConnect();
    const [migrating, setMigrating] = useState(false);
    const err = useError();

    async function updateComps(){
        _00x0.api('getComps', {limit_: 3, page_: 1}).then((data) => {
            setComps(data.result);
        })
    }

    async function updateState(){
        updateComps();
        fetchBalance()
    }

    async function handleMigrate(works){
        
        setMigrating(true);
        works = works.map(id => parseInt(id));
        const values = Array(works.length).fill(1);
        const from = account;
        const to = _00x0.contract.address;
        try {
            const tx = await _77x7.contract.safeBatchTransferFrom(from, to, works, values, [])
            const receipt = await tx.wait();
            console.log(receipt)
            setMigrating(false);
            updateState();
        }
        catch(e){
            err.setMessage(e.message)
            setMigrating(false);
        }
        
    }


    async function handleMint(comp){
        _00x0.contract.mint(comp.id, {value: comp.price});
    }

    useEffect(() => {

        updateComps()

    }, [])


    return <Page bgColor="#000">
        <Grid>
            {comps && comps.filter(comp => comp.id).map(comp => <Grid.Unit key={comp.id}>

            <CompImage>
                <img src={comp.artwork}/>
            </CompImage>
            <Section>
            <div>Created by {comp.creator}</div>
            <div>{comp.available}/{comp.editions}</div>
            <div>{ethers.utils.formatEther(comp.price)} ETH</div>

            {account ? <button onClick={() => handleMint(comp)}>Mint</button> : <span>Connect to mint</span> }
            </Section>
            </Grid.Unit>)}
        </Grid>
        <Grid>
            <Grid.Unit size={1/2}>
                <Section dangerouslySetInnerHTML={{__html: props.page00x0.content}}/>
            </Grid.Unit>
            <Grid.Unit size={1/2}>
                <MintingSection disabled={migrating}>
                    {!account && <>
                            <a href="#" onClick={() => setWantToConnect(true)}>Connect your wallet</a> holding 77x7 works to view them here
                    </>}
                    {(fetchingBalance) && <>Looking for 77x7 works...</>}

                        {(balance && !fetchingBalance) && <><Works>
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
                        <button disabled={selectedWorks.length < 2 || selectedWorks.length > 7} onClick={() => handleMigrate(selectedWorks)}>
                            {(selectedWorks.length < 2 || selectedWorks.length > 7) ? `Select 2-7 works to create 00x0` : `Create 00x0 from ${selectedWorks.length} works`}
                        </button>
                        </>
                        }
                </MintingSection>
            </Grid.Unit>
        </Grid>
    </Page>

}

function _00x0(p){
    return <_77x7Provider><_00x0Provider><ZeroZeroByZero {...p}/></_00x0Provider></_77x7Provider>;
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