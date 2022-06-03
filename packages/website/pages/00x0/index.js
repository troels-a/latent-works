import Page from "templates/Page"
import Grid from "styled-components-grid"
import Section from "components/Section/Section";
import use77x7, {_77x7Provider} from "hooks/use77x7";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useRef, useState } from "react";
import { isArray, isObject, map, result } from "lodash";
import useWork, { WorkProvider } from "hooks/useWork";
import styled, { keyframes, useTheme } from "styled-components";
import use00x0, { _00x0Provider } from "hooks/use00x0";
import { AspectRatio } from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import { getEntryBySlug } from "base/contentAPI";
import {useConnectIntent} from "components/ConnectButton";
import { ethers } from "ethers";
import useError from "hooks/useError";
import Modal, {ModalInner} from "components/Modal";
// Import Swiper styles
import Link from "next/link";
import useENS from "hooks/useENS";
import {breakpoint} from "styled-components-breakpoint";
import { errToMessage } from "base/errors";
import { useRouter } from "next/dist/client/router";
import Loader from "components/Loader";
import Button from "components/Button";

const PRICE = ethers.utils.parseEther('0.07');

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


const CompModal = styled(Modal)`
    min-height: 100vh;
    display: flex;
    flex-wrap: wrap;
    place-items: center;
    justify-content: center;
    > div {
        width: 100%;
    }
`


const CompImage = styled(({image, ...p}) => <div {...p}><img src={image}/></div>)`
    width: 100%;
    display: flex;
    place-items: center;
    justify-items: center;
    height: 100%;
    box-sizing: border-box;
    ${p => p.pad && 'padding: 0 2vw 2vw 2vw;'}
    ${p => p.onClick && 'cursor: pointer;'}
    opacity: 0;
    pointer-events: none;
    transition: opacity 300ms ease-out;

    ${p => p.show && `
        opacity: 1;
        pointer-events: all;
    `}

    > img {
        position: relative;
        top: -3vw;
        margin: 0 auto;
        max-height: ${p => p.maxHeight ? p.maxHeight : 73}vh;
        width: auto;
    }
`


const CompInfo = styled(Section)`
    display: flex;
    ${breakpoint('sm', 'md')`
        flex-direction: column;
    `}
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    padding-bottom: 3vw;
    box-sizing: border-box;
    > div {

        ${breakpoint('sm', 'md')`
            margin-top: 5vw;
            width: 100%;
        `}

        width: 33%;

        ${breakpoint('lg')`
            &:nth-child(2) {
                text-align: center;
            }
        `}

        &:last-child {
            text-align: right;
        }
    }

    ${breakpoint('sm', 'md')`
        button {
            width: 100%;
        }
    `}
    opacity: 0;
    pointer-events: none;
    transition: opacity 300ms ease-out;
    ${p => p.show && `
        opacity: 1;
        pointer-events: all;
    `}
`

const Comp = styled.div`
    position: relative;
    ${breakpoint('sm', 'md')`
        top: -12vw;
    `}
    > div {
        height: 100%;
        place-items: center;
    }
`

const Comps = styled(Section)`
    min-height: 60vh;
    display: flex;
    flex-wrap: wrap;
    place-items: center;
    justify-content: center;
    max-width: 100%;
    margin: 0 auto;
`

const IntroSection = styled(Grid.Unit)`


    &:last-child {
        text-align: right;
    }
    

    ${breakpoint('sm', 'md')`
        
        margin-bottom: 5vw;

    `}

`

// const FlexImg = styled.img`
//     width: 100%;
//     height: auto;
//     box-sizing: border-box;
//     ${p => p.pad && 'padding: 0 2vw 2vw 2vw'}
// `


function EnsAddress({input, ...p}){
    const {ENS, address} = useENS(input);
    return <>{ENS ? ENS : address && `${address.slice(0,6)}...${address.slice(38,42)}` }</>
}


function _00x0_Index(props){

    const router = useRouter();
    const {account} = useWeb3React();
    const _00x0 = use00x0();
    const [comp, setComp] = useState(false); // false = unset, -102 = loading, -404 = not found
    const [comps, setComps] = useState(false); // false = unset, -102 = loading, -404 = not
    const [compsPage, setCompsPage] = useState(1);
    const [compsLimit, setCompsLimit] = useState(9);
    const {connectIntent, setConnectIntent} = useConnectIntent();
    const err = useError(); 
    const [compCount, setCompCount] = useState(-102); // false = unset, -102 = loading, -404 = not

    useEffect(() => {
        updateCompCount();
    }, [])

    async function updateCompCount(){
        const count = await _00x0.api('getCompCount');
        setCompCount(count.result);
    }

    async function fetchComp(id){

        if(comp === -102)
            return;

        setComp(-102);
        const data = await _00x0.api('getComp', {comp_id_: id});

        if(data.error){
            setComp(false);
            return;
        }

        const comp = data.result;
        setComp(comp);

    }

    /// Fetch comps
    async function fetchComps(){

        if(comps == -102) // Loading - return
            return;

        setComps(-102);
        const data = await _00x0.api('getComps', {page_: compsPage, limit_: compsLimit});

        if(data.error){
            setComps(false);
            err.send(data.error);
            return;
        }

        setComps(data.result);

    }


    async function handleMint(comp){
        try {
            await _00x0.contract.mint(comp.id, {value: PRICE});
        }
        catch(error){
            err.send(errToMessage(error.message))
        }
    }


    useEffect(() => {
        if(compsPage)
            fetchComps()
    }, [compsPage])


    useEffect(() => {
        if(router.query.comp)
            fetchComp(router.query.comp)
    }, [router])


    async function prevCompsPage(){
        if(comps !== -102 && compsPage-1 > 0) // loading
            setCompsPage(compsPage-1)
    }

    async function nextCompsPage(){
        if(comps !== -102 && (compsPage*compsLimit) <= compCount) // loading
            setCompsPage(compsPage+1)
    }

    async function goToComp(id){
        if(id <= compCount && id > 0){
            router.replace(`/00x0?comp=${id}`)
        }
    }

    async function resetComp(){
        router.replace(`/00x0`)
        setComp(false);
    }

    async function randomComp(){
        if(compCount > 0){
            const rand = Math.floor(Math.random() * compCount)+1;
            goToComp(rand);
        }
    }
    
    const theme = useTheme();

    const inputRef = useRef();

    return <Page bgColor="#000">
        
        <Section $padBottom={12} $padTop={6}>
            <Grid>
                <IntroSection size={{sm: 1/1, md: 4/12}}>
                    <h1>{props.page00x0.title}</h1>
                    <h3>{props.page00x0.subtitle}</h3>
                    <div dangerouslySetInnerHTML={{__html: props.page00x0.content}}/>
                </IntroSection>
                <IntroSection size={{sm: 1/1, md: 8/12}}></IntroSection>
                <IntroSection size={{sm: 9/24, md: 6/12}}>
                    <Button onClick={() => router.push('/00x0/transfer')} expandOn={['sm', 'md']} invertColors>Create comp</Button>
                </IntroSection>
                <IntroSection size={{sm: 15/24, md: 6/12}}>
                    {/* <p>
                    {compCount === 1 && `One comp created`}
                    {compCount > 1 && `${compCount} comps created`}
                    {compCount === -102 && <Loader>Fetching comps</Loader>}
                    <br/>
                    Load a specific comp or let the gods decide
                    </p> */}
                    <input type="number" onKeyPress={e => {e.key == 'Enter' && goToComp(inputRef.current.value)}} ref={inputRef} min={1} max={compCount}/>
                    <Button onClick={() => goToComp(inputRef.current.value)}>Load</Button>
                    <Button onClick={randomComp}>Random</Button>

                </IntroSection>

            </Grid>
        </Section>
        

        {comps === -102 && <Comps><Loader>Loading comps</Loader></Comps>}
        {compCount === 0 && <Comps>No comps have been created yet</Comps>}

        {(isArray(comps) && compCount > 0) && // THERE ARE COMPS
        <div>            
            <Comps>
                {comps.map(comp => <Grid.Unit size={{sm: 1/2, md: 1/3}}>
                    <CompImage maxHeight={200} pad onClick={() => goToComp(comp.id)} image={comp.image} show={true}/>
                </Grid.Unit>)}
            </Comps>
            <Section style={{display: 'flex', justifyContent: 'center'}} $padBottom={10} $padTop={10}>
                <Button disabled={compsPage === 1} onClick={prevCompsPage}>Previous set</Button>
                <Button disabled={(compsPage*compsLimit) >= compCount} onClick={nextCompsPage}>Next set</Button>
            </Section>            
        </div>}
        

        <CompModal show={comp}>
            {comp === -102 && <ModalInner center><Loader>Loading comp #{router.query.comp}</Loader></ModalInner>}
            {isObject(comp) && <>

                <Comp>
                    <CompImage {...comp} show={isObject(comp)}/>
                </Comp>
                <CompInfo show={isObject(comp)}>
                <div>
                    <div><small>Created by <EnsAddress input={comp.creator}/></small></div>
                    <div><small>{comp.available > 0 ? `${comp.available} of ${comp.editions} left`: `Edition of ${comp.editions}`}</small></div>
                </div>
                <div>
                    <div>
                        {account && comp.available > 0 
                        ? 
                        <Button expandOn={['sm', 'md']} disabled={account == comp.creator} onClick={() => handleMint(comp)}>
                            {account == comp.creator ? `Creator can't mint` : <>Mint <small>({ethers.utils.formatEther(PRICE)} ETH)</small></>}
                        </Button>
                        :
                        <Button expandOn={['sm', 'md']} onClick={() => setConnectIntent(!connectIntent)}>{comp.available > 0 ? 'Connect to mint' : 'Sold out'}</Button>
                        }
                    </div>
                </div>
                <div>
                    <Button onClick={resetComp}>Close</Button>
                </div>
                </CompInfo>
            
            </>}
        </CompModal>

    </Page>

}

function ZeroZeroByZeroIndex(p){
    return <_77x7Provider><_00x0Provider><_00x0_Index {...p}/></_00x0Provider></_77x7Provider>;
}


export async function getStaticProps(){
    
    const page00x0 = await getEntryBySlug('pages', '00x0');

    return {
        props: {
            page00x0: page00x0,
        }
    }
}

export default ZeroZeroByZeroIndex;