import Section from "components/Section/Section";
import styled, { css, keyframes, useTheme } from "styled-components";
import Page from "templates/Page";
import MEMPOOLS_ABI from "@lw/contracts/abi/LWMempools.json"
import useContract from "hooks/useContract";
import {ethers} from 'ethers';

import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { useConnectIntent } from "components/ConnectButton";
import Loader from "components/Loader";
import Grid from "styled-components-grid";
import {breakpoint} from "styled-components-breakpoint";


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

    ${breakpoint('sm', 'md')`
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

const mainWidth = 37.46;

export default function Mempools_index(){
    
    const {account} = useWeb3React();
    const [banks, setBanks] = useState();
    const [selBank, setSelBank] = useState(false);
    const [bank, setBank] = useState(false);
    const [selPool, setSelPool] = useState(false);
    const {setConnectIntent} = useConnectIntent();
    const [minting, setMinting] = useState(false);
    const [pools, setPools] = useState({});

    const mempools = useContract({
        address: process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS,
        abi: MEMPOOLS_ABI,
        endpoint: '/api/mempools'
    });

    async function handleMint(bank_index, index){
        setMinting(index);
        try {
            const price = await mempools.read('PRICE').then(res => res.result);
            const tx = await mempools.contract.mint(bank_index, index, {value: ethers.BigNumber.from(price.hex)});
            await tx.wait();
            await updateBank(bank_index);
        }
        catch(e){
            setMinting(false);
        }
        setMinting(false);
    }

    async function populatePools(bank_index, update = true){
        banks[bank_index].pools.map((_,pool_index) => populatePool(bank_index, pool_index, update));        
    }

    async function populatePool(bank_index, pool_index, update = true){
        
        let pool_id = banks[bank_index].pools[pool_index];
        let pool = false;

        if(!update && pools[pool_id])
            return false;

        if(pool_id){
            const meta = await mempools.read('tokenURI', {pool_id_: pool_id}).then(res => res.result);
            pool = JSON.parse(Buffer.from(meta.replace('data:application/json;base64,', ''), 'base64').toString('utf-8'));
            pool.id = pool_id;   
            setPools(oldPools => {
                const newPools = {...oldPools};
                newPools[pool_id] = pool;
                return newPools;
            });
        }

    }

    async function updateBank(bank_index){
        
        const new_bank = await mempools.read('getBank', {index_: bank_index}).then(res => res.result);

        if(!new_bank)
            return null;

        setBanks(banks => {
            const new_banks = [...banks];
            new_banks[bank_index] = {...new_bank};
            return new_banks;    
        })      

    }

    async function fetchBanks(){
        let newbanks = await mempools.read('getBanks').then(res => res.result)
        newbanks = newbanks.map(bank => {
            bank.pools = bank.pools.map(pool_id => pool_id > 0 ? pool_id : false);
            return bank;
        })
        setBanks(newbanks);
        if(newbanks)
            setSelBank(0);
    }

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
        }
    }, [selBank])


    useEffect(() => {
        if(banks){
            for (let i = 0; i < banks.length; i++) {
                const bank = banks[i];
                populatePools(i, false);
            }
        }
    }, [banks])


    return <Page theme="dark">
        <Filters/>
        <Section>
            <h1>Mempools</h1>
        </Section>
        <Section disable={minting}>

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

            {banks && banks[selBank] && 
            <Grid as={Bank}>
                <Grid.Unit as={BankMain} size={{sm: 1/1, lg: mainWidth/100}}>
                    
                    {selPool !== false && 
                        <img src={banks[selBank].pools[selPool].image}/>
                    }
                    
                    {selPool === false && 
                    <BankImgs filter={selPool === false ? bank.filter : false} >
                        <BankImg src={banks[selBank].parts[3]} index={3}/>
                        <BankImg src={banks[selBank].parts[0]} animated index={0}/>
                        <BankImg src={banks[selBank].parts[1]} animated index={1}/>
                        <BankImg src={banks[selBank].parts[2]} animated index={2}/>
                        <BankImg src={banks[selBank].parts[3]} animated index={3}/>                    
                    </BankImgs>
                    }
                </Grid.Unit>

                <Grid.Unit size={{sm: 1/1, lg: (100-mainWidth)/100}}>
                    <Grid as={Pools}>
                        {banks[selBank].pools.map((pool_id, i) => {

                            const pool = pools[pool_id];
                            const loading = (pool && typeof pool === 'undefined');

                            return <Grid.Unit as={Pool} size={1/5} key={i} loading={loading}>
                                {pool && <img src={pool.image} onClick={() => setSelPool(i)}/>}
                                {!pool && <Mint onClick={() => account ? handleMint(selBank, i) : setConnectIntent(true)}>
                                {(minting === i) ? <Loader/> : '+'}
                                </Mint>}
                            </Grid.Unit>

                        })}
                    </Grid>
                </Grid.Unit>
            </Grid>
            }

            {banks === false && <p>loading...</p>}
            {(banks && banks.length === 0) && <p>no banks</p>}
        </Section>
    </Page>

}