import Section from "components/Section/Section";
import styled, { css, keyframes } from "styled-components";
import Page from "templates/Page";
import MEMPOOLS_ABI from "@lw/contracts/abi/LWMempools.json"
import useContract from "hooks/useContract";
import { getEntryBySlug } from "base/contentAPI";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState, useRef } from "react";
import { useConnectIntent } from "components/ConnectButton";
import Loader from "components/Loader";
import Grid from "styled-components-grid";
import {breakpoint} from "styled-components-breakpoint";
import { useLTNT } from "components/LTNT/Provider";
import { useRouter } from "next/dist/client/router";
import { useMempool } from "hooks/useMempool";
import useInterval from "hooks/useInterval";
import Countdown from "react-countdown";
const fifteen = Array(15).fill(0).map((_, i) => i);

const Filters = () => {
    return <svg style={{display: 'none'}}>
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>
        <filter id="none"><feColorMatrix in="SourceGraphic" type="saturate" values="1"/></filter>
        <filter id="bw"><feColorMatrix type="matrix" values="0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter>
        <filter id="s1"><feColorMatrix in="SourceGraphic" type="saturate" values="2"/></filter>
        <filter id="s2"><feColorMatrix in="SourceGraphic" type="saturate" values="4"/></filter>
        <filter id="s3"><feColorMatrix in="SourceGraphic" type="saturate" values="6"/></filter>
        <filter id="s4"><feColorMatrix in="SourceGraphic" type="saturate" values="8"/></filter>
        <filter id="s5"><feColorMatrix in="SourceGraphic" type="saturate" values="10"/></filter>
        <filter id="s6"><feColorMatrix in="SourceGraphic" type="saturate" values="12"/></filter>
        <filter id="s7"><feColorMatrix in="SourceGraphic" type="saturate" values="14"/></filter>
        <filter id="s8"><feColorMatrix in="SourceGraphic" type="saturate" values="16"/></filter>
        <filter id="s9"><feColorMatrix in="SourceGraphic" type="saturate" values="18"/></filter>
        <filter id="s10"><feColorMatrix in="SourceGraphic" type="saturate" values="20"/></filter>
        <filter id="r1"><feColorMatrix in="SourceGraphic" type="hueRotate" values="20"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r2"><feColorMatrix in="SourceGraphic" type="hueRotate" values="40"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r3"><feColorMatrix in="SourceGraphic" type="hueRotate" values="60"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r4"><feColorMatrix in="SourceGraphic" type="hueRotate" values="80"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r5"><feColorMatrix in="SourceGraphic" type="hueRotate" values="100"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r6"><feColorMatrix in="SourceGraphic" type="hueRotate" values="120"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r7"><feColorMatrix in="SourceGraphic" type="hueRotate" values="140"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r8"><feColorMatrix in="SourceGraphic" type="hueRotate" values="160"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r9"><feColorMatrix in="SourceGraphic" type="hueRotate" values="180"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r10"><feColorMatrix in="SourceGraphic" type="hueRotate" values="200"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
    </svg>
}

const fadeInOut = keyframes`
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
`;

const bgFadeInOut = keyframes`
    0% { background-color: rgba(255,255,255,0); }
    50% { background-color: rgba(255,255,255,0.1); }
    100% { background-color: rgba(255,255,255,0); }
`;

const BankSelector = styled.ul`
    
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    width: 100%;
    padding: 1rem 0;
    &, * {
        box-sizing: border-box;
    }

`

const BankOption = styled.li`

    cursor: pointer;
    display: inline-block;
    background-color: rgba(255,255,255,0.1);
    padding: 0.5rem 1rem;
    box-sizing: border-box;
    font-style: italic;
    width: 6.66%;
    border-right: 1px solid ${p => p.theme.colors.bg};
    border-bottom: 1px solid ${p => p.theme.colors.bg};
    text-align: center;
    line-height: 0;
    padding: 1.2rem 0;
    ${p => p.active && css`
        background-color: rgba(255,255,255,0.4);
    `}

`


const Bank = styled.div`

    border: 1px solid ${p => p.theme.colors.emph9};
    display: flex;
    flex-direction: row;
    * {
        box-sizing: border-box;
    }
    ${p => p.open && `
        opacity: 0.2;
    `}

    position: relative;

`

const BankMain = styled.div`
    position: relative;
    overflow: hidden;
    > img {
        display: table;
    }
`

const BankImgs = styled.div`
    
    position: relative;
    aspect-ratio: 1/1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    place-items: center;
    justify-items: center;
    min-width: 100%;
    width: 100%;

    ${p => p.filter && `
        filter: url(#${p.filter});
        &:after {
            content: "";
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            opacity: 0.2;
            overflow: hidden;
            filter: url(#noise) url(#bw);
            position: absolute;
        }
    `}

`

const Pools = styled.div`

`

const Pool = styled(({children, ...p}) => <div {...p}><div>{children}</div></div>)`

    aspect-ratio: 1/1;
    > div {
        height: 100%;
    }

    ${p => p.loading && css`
        animation: ${bgFadeInOut} 1s infinite;
    `}

    border: 0px solid ${p => p.theme.colors.emph9};
    border-left-width: 1px;

    &:nth-child(6),
    &:nth-child(7),
    &:nth-child(8),
    &:nth-child(9),
    &:nth-child(10),
    &:nth-child(11),
    &:nth-child(12),
    &:nth-child(13),
    &:nth-child(14),
    &:nth-child(15)
    {
        border-top-width: 1px;
    }

    ${breakpoint('sm', 'lg')`
        &:nth-child(1),
        &:nth-child(2),
        &:nth-child(3),
        &:nth-child(4),
        &:nth-child(5){
            border-top-width: 1px;
        }

        &:nth-child(1),
        &:nth-child(6),
        &:nth-child(11)
        {
            border-left-width: 0px;
        }

    `}

    img {
        width: 100%;
        display: table;
    }

`



const BankImg = styled.img`
    width: 100%;
    height: auto;
    overflow: hidden;
    position: absolute;
    top: 0;

    ${p => p.animated && css`
        opacity: 0;
        animation: ${fadeInOut} 20s ${p => (p.index*10)}s linear infinite;
    `}

`

const Mint = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover, &:focus {
        opacity: 0.5;
    }
`

const SelImg = styled.img`
    width: 100%;
    height: auto;
    cursor: pointer;
`

const Notice = styled.span`

    display: block;
    font-size: 0.8em;
    font-style: italic;
    border: 1px solid ${p => p.theme.colors.emph9};
    border-radius: 0.5em;
    margin: 0.5em 0;
    padding: 0.5em;

    &:before {
        content: "!";
        display: block;
        font-size: 1em;
        line-height: 1em;
        text-align: center;
        font-weight: 600;
        width: 1.2em;
        height: 1.2em;
        padding: 3px;
        background-color: ${p => p.theme.colors.emph9};
        color: ${p => p.theme.colors.txt};
        border-radius: 3px;
        margin-bottom: 0.5em;
    }

`

const Progress = styled(p => {
    return <div {...p}><div></div></div>
})`
    height: 0.5rem;
    background-color: ${p => p.theme.colors.emph9};
    overflow: hidden;
    position: relative;
    > div {
        height: 100%;
        background-color: ${p => p.theme.colors.emph8};
        position: absolute;
        top: 0;
        left: 0;
        width: ${p => (p.value/p.max)*100}%;
    }
`

const Left = styled.small`
user-select: none;
    cursor: pointer;
    position: relative;
    em {
        position: absolute;
        font-size: 0.6em;
        top: -1.1em;
        right: 0;
    }
`

const humanizeProps = {
    M: 1000
}
const PoolStats = styled(({id, ...p}) => {

    const {loading, error, ...mempool} = useMempool(id);
    const [left, setLeft] = useState(0)
    const [format, setFormat] = useState('seconds')

    useEffect(() => {
        if(loading) 
            setLeft(0)
    }, [loading])

    useEffect(() => {
        if(!loading && mempool.epoch_remaining) {
            
            setLeft(mempool.epoch_remaining)
            
            let timing = 1000;
            if(format === 'minutes')
                timing = 1000*60;
            else if(format === 'hours')
                timing = 1000*60*60;
            else if(format === 'days')
                timing = 1000*60*60*24;            

            const interval = setInterval(() => {
                setLeft(left => left - 1)
            }, timing)

            return () => {
                clearInterval(interval)
                setLeft(0)
            }

        }
    }, [loading, mempool.epoch_remaining, format])
    

    const shiftFormat = () => {
        if(format === 'seconds')
            setFormat('minutes')
        else if(format === 'minutes')
            setFormat('hours')
        else if(format === 'hours')
            setFormat('days')
        else if(format === 'days')
            setFormat('seconds')
    }

    const formatSeconds = (seconds) => {
        if(format === 'seconds')
            return seconds
        else if(format === 'minutes')
            return Math.round(seconds/60);
        else if(format === 'hours')
            return Math.round(seconds/60/60);
        else if(format === 'days')
            return Math.round(seconds/60/60/24);
    }


    return <div {...p}>
        {loading && <small><Loader></Loader></small>}
        {error && <small>Error fetching stats</small>}
        {!loading && <div>
            
            <div style={{display: 'flex', placeContent: 'space-between'}}>
                <small style={{position: 'absolute', top: '0.5em', left: '0.5em'}}>#{id}</small>
                <small>{`+`.repeat(mempool.epoch)}</small>
                <Left onClick={e => shiftFormat()}>
                    <em>{left > 0 && format}</em>
                    {left > 0 && formatSeconds(left)}
                </Left>
                {/* Epoch length: {moment.duration(mempool.epoch_length, "seconds").humanize(humanizeProps)}
                Next epoch begins in {moment.duration(mempool.epoch_remaining, "seconds").humanize(humanizeProps)} */}
            </div>
            <Progress value={mempool.epoch_length - left} max={mempool.epoch_length}></Progress>

        </div>}
    </div>
})`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    min-width: 100%;
    padding: 0.5em;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    background-color: transparent;
    color: ${p => p.theme.colors.txt};
    > div {
        flex: 1;
        min-width: 100%;
    }
`

const mainWidth = 37.46;

export default function Mempools_index({page, ...p}){
    
    const {account, provider} = useWeb3React();
    const [banks, setBanks] = useState();
    const [selBank, setSelBank] = useState(false);
    const [bank, setBank] = useState(false);
    const [selPool, setSelPool] = useState(false);
    const [mintPool, setMintPool] = useState(false);
    const [pools, setPools] = useState({});

    const LTNT = useLTNT();

    const mempools = useContract({
        address: process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS,
        abi: MEMPOOLS_ABI,
        endpoint: '/api/mempools'
    });

    const router = useRouter();
    

    async function populatePools(bank_index, update = true){
        banks[bank_index].pools.map((_,pool_index) => populatePool(bank_index, pool_index, update));        
    }

    async function populatePool(bank_index, pool_index, update = true){
        
        let pool_id = banks[bank_index].pools[pool_index];
        let pool = false;

        if(!update && pools[pool_id])
            return false;

        if(pool_id){
            let image = await mempools.read('getPoolImage', {pool_id_: pool_id, encode_: true}).then(res => res.result);
            setPools(oldPools => {
                const newPools = {...oldPools};
                newPools[pool_id] = {image, bank_index, pool_index};
                return newPools;
            });
        }

    }

    async function fetchBanks(){
        let newbanks = await mempools.read('getBanks').then(res => res.result)
        if(!newbanks)
            return null;
        newbanks = newbanks.map(bank => {
            bank.pools = bank.pools.map(pool_id => pool_id > 0 ? pool_id : false);
            return bank;
        })
        setBanks(newbanks);
        if(newbanks)
            setSelBank(0);
    }

    useEffect(() => {
        const _bank = router.query.bank ? parseInt(router.query.bank) : false;
        if(_bank && banks && banks.length >= _bank)
            setSelBank(_bank);
    }, [router.query.bank, banks])

    useEffect(() => {
        fetchBanks();
    }, []);

    useEffect(() => {
        if(selBank !== false && banks[selBank]){
            setBank(banks[selBank]);
            populatePools(selBank, false);
        }
        return () => {
            setSelPool(false);
            setMintPool(false);
        }
    }, [selBank])


    useEffect(() => {
        if(LTNT.picked){
            LTNT.hasStamp(LTNT.picked, process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS)
            .then(hasStamp => {
                setHasStamp(hasStamp);
            })
        }
    }, [LTNT.picked, mintPool])


    return <Page theme="dark" title={page.title} description={page.description}>
        
        <Filters/>
        
        <Section>
            <h1>Mempools</h1>
        </Section>

        <Section>
            
            <Grid as={BankSelector}>
                {fifteen.map((index) => {

                    if(banks && banks[index]){
                        const b = banks[index];
                        return <Grid.Unit as={BankOption} size={{sm: 1/3, md: 1/5, lg: 1/15}} key={index} active={selBank === index} onClick={() => setSelBank(index)}>
                            {b && b.name}
                        </Grid.Unit>
                    }               
                    return <Grid.Unit as={BankOption} size={{sm: 1/3, md: 1/5, lg: 1/15}} key={index}/>     

                })}
            </Grid>

            {(banks && banks[selBank]) && 
            <Grid as={Bank}>
                <Grid.Unit as={BankMain} size={{sm: 1/1, lg: mainWidth/100}}>

                    {(selPool !== false && pools[banks[selBank].pools[selPool]]) && 
                    <>
                        <PoolStats id={banks[selBank].pools[selPool]} />
                        <img src={pools[banks[selBank].pools[selPool]].image}/>
                    </>
                    }
                    
                    {(selPool === false || (selPool !== false && !pools[banks[selBank].pools[selPool]])) && 
                    <BankImgs filter={(banks && selPool === false) ? banks[selBank].filter : false} >
                        <BankImg src={banks && banks[selBank].parts[3]} index={3}/>
                        <BankImg src={banks && banks[selBank].parts[0]} animated index={0}/>
                        <BankImg src={banks && banks[selBank].parts[1]} animated index={1}/>
                        <BankImg src={banks && banks[selBank].parts[2]} animated index={2}/>
                        <BankImg src={banks && banks[selBank].parts[3]} animated index={3}/>                    
                    </BankImgs>
                    }
                </Grid.Unit>

                <Grid.Unit size={{sm: 1/1, lg: (100-mainWidth)/100}}>
                    <Grid as={Pools}>
                        {banks[selBank].pools.map((pool_id, i) => {

                            const pool = pools[pool_id];
                            const loading = (pool && typeof pool === 'undefined');

                            return <Grid.Unit as={Pool} size={1/5} key={i} loading={loading}>
                                {pool && <SelImg src={pool.image} onClick={() => setSelPool(i)}/>}
                            </Grid.Unit>

                        })}
                    </Grid>
                </Grid.Unit>
            </Grid>
            }

            
            {(!banks || banks.length < 1) && 
            <Grid as={Bank}>
                <Grid.Unit as={BankMain} size={{sm: 1/1, lg: mainWidth/100}}>
                    <BankImgs filter={false}>
                        <Loader style={{margin: '0 auto'}}>Loading banks</Loader>
                    </BankImgs>
                </Grid.Unit>

                <Grid.Unit size={{sm: 1/1, lg: (100-mainWidth)/100}}>
                    <Grid as={Pools}>
                        {fifteen.map((_, i) => {
                            return <Grid.Unit as={Pool} size={1/5} key={i}>
                                <Mint/>
                            </Grid.Unit>
                        })}
                    </Grid>
                </Grid.Unit>
            </Grid>
            }

            {banks === false && <p>loading...</p>}

        </Section>

                
        <Section dangerouslySetInnerHTML={{__html: page.content}}/>    

    </Page>

}


export async function getStaticProps(){
    
    const page = await getEntryBySlug('pages', 'mempools');
    return {
        props: {
            page: page,
        }
    }
}