import Page from "templates/Page"
import Grid from "styled-components-grid"
import Section from "components/Section/Section";
import use77x7, {_77x7Provider} from "hooks/use77x7";
import { useWeb3React } from "@web3-react/core";
import { Children, useEffect, useState } from "react";
import { keys, map, mapKeys, mapValues } from "lodash";
import useWork, { WorkProvider } from "hooks/useWork";
import { WorkImage } from "components/WorkDisplay/WorkDisplay";
import styled, { keyframes } from "styled-components";
import use00x0, { _00x0Provider } from "hooks/use00x0";
import { AspectRatio } from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import { getEntryBySlug } from "base/contentAPI";
import { useWantToConnect } from "components/ConnectButton/ConnectButton";
import { ethers } from "ethers";

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
    > * {
        animation: ${colorPulse} 2s infinite;
        border: 5px solid transparent; box-sizing: border-box;

        ${p => p.selected && 'border-color: red;'}
    }
`

function SelectableWork(p){

    const work = useWork()
    
    return <Work {...p}>
        {work && <img style={{height: 'auto', maxWidth: '100%'}} key={work.id} src={work.iterations[6]}/>}
    </Work>

}


function ZeroZeroByZero(props){

    const {account} = useWeb3React();
    const {balance, fetchingBalance} = use77x7();
    const {contract} = use00x0();
    const [selectedWorks, setSelectedWorks] = useState({});
    const {wantToConnect, setWantToConnect} = useWantToConnect();

    function handleCreate(){
        const works = keys(selectedWorks).map(id => parseInt(id));
        contract.create(works);
    }


    return <Page bgColor="#000">
        <Grid>
            <Grid.Unit size={1/2}>
                <Section dangerouslySetInnerHTML={{__html: props.page00x0.content}}/>
            </Grid.Unit>
            <Grid.Unit size={1/2}>
                <Section>
                    {!account && <>
                            <a href="#" onClick={() => setWantToConnect(true)}>Connect your wallet</a> holding 77x7 works to view them here
                    </>}
                    {(fetchingBalance) && <>Looking for 77x7 works...</>}

                        {(balance) && <><Works>
                            {map(balance, (_bal, _id) => {
                            const updatedValue = {}
                            updatedValue[_id] = !selectedWorks[_id];
                            return <WorkProvider workID={_id}>
                                <SelectableWork selected={selectedWorks[_id]} onClick={() => setSelectedWorks(prev => ({...prev, ...updatedValue}))}/>
                            </WorkProvider>
                            })}
                        </Works>
                        <button disabled={keys(selectedWorks).length < 1} onClick={handleCreate}>Create 00x0</button>
                        </>
                        }
                </Section>
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