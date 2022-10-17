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

const Filters = () => {
    return <svg style={{display: 'none'}}>
        <filter id="none"><feColorMatrix in="SourceGraphic" type="saturate" values="1"/></filter>
        <filter id="sat"><feColorMatrix in="SourceGraphic" type="saturate" values="5"/></filter>
        <filter id="bw"><feColorMatrix type="matrix" values="0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter>,
        <filter id="hue"><feColorMatrix in="SourceGraphic" type="hueRotate" values="40"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>,
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>,
    </svg>
}

const fadeInOut = keyframes`
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
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

`

const BankOption = styled.li`

    cursor: pointer;
    display: inline-block;
    background-color: rgba(255,255,255,0.1);
    padding: 0.5rem 1rem;
    box-sizing: border-box;
    margin-right: 1px;
    font-style: italic;
    width: 6.66%;

    ${p => p.active && css`
        background-color: rgba(255,255,255,0.4);
    `}
`


const Bank = styled.div`

    display: flex;
    flex-direction: row;

    ${p => p.open && `
        opacity: 0.2;
    `}

    position: relative;

`

const BankMain = styled.div`
    min-width: 36.9%;
    padding-right: 2px;
    position: relative;
    overflow: hidden;
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

const BankImgs = styled.div`
    position: relative;
`

const Pools = styled.div`
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    justify-items: flex-start;
    margin-bottom: auto;
    flex-grow: 1;    
`

const Pool = styled(({children, ...p}) => <div {...p}><div>{children}</div></div>)`

    box-sizing: border-box;
    padding: 0 1px 1px 0;
    
    > div {
        width: 11.8vw;
        height: 11.8vw;
        background-color: rgba(255,255,255,0.1);
    }

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
    z-index: 0;
    ${p => p.animated && css`
        opacity: 0;
        animation: ${fadeInOut} 20s ${p => (p.index*10)}s linear infinite;
    `};
`

const Mint = styled.div`
    width: 11.8vw;
    height: 11.8vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    &:hover, &:focus {
        opacity: 0.5;
    }
`


export default function Mempools_index(){
    
    const {account} = useWeb3React();
    const [banks, setBanks] = useState();
    const [selBank, setSelBank] = useState(false);
    const [bank, setBank] = useState(false);
    const [selPool, setSelPool] = useState(false);
    const {setConnectIntent} = useConnectIntent();
    const [minting, setMinting] = useState(false);

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
            await fetchBank(bank_index);    
        }
        catch(e){
            setMinting(false);
        }
        setMinting(false);
    }

    async function populatePools(bank_input){
        return Promise.all(bank_input.pools.map(async (pool_id, i) => {
            if(!pool_id)
                return false;
            const meta = await mempools.read('tokenURI', {pool_id_: pool_id}).then(res => res.result);
            bank_input.pools[i] = JSON.parse(Buffer.from(meta.replace('data:application/json;base64,', ''), 'base64').toString('utf-8'));
        }))
    }

    async function fetchBank(bank_index){
        const new_bank = await mempools.read('getBank', {index_: bank_index}).then(res => res.result);
        if(new_bank)
            await populatePools(new_bank)
        setBanks(banks => {
            const new_banks = [...banks];
            new_banks[bank_index] = new_bank;
            return new_banks;
        })
    }

    async function fetchBanks(){
        const banks = await mempools.read('getBanks').then(res => res.result);
        for(let i = 0; i < banks.length; i++){
            const b = banks[i];
            await populatePools(b);
        }
        setBanks(banks);
        if(banks)
            setSelBank(1);
    }

    useEffect(() => {
        fetchBanks();
    }, []);

    useEffect(() => {
        if(selBank !== false && banks[selBank])
            setBank(banks[selBank]);
    }, [banks])

    useEffect(() => {
        if(selBank !== false){
            setBank(banks[selBank]);
            setSelPool(false);
        }
    }, [selBank])

    return <Page bgColor="black" txtColor="white">
        <Filters/>
        <Section>
            <h1>Mempools</h1>
        </Section>
        <Section disable={minting}>
            <BankSelector>
                {!banks && <Loader/>}
                {banks && banks.map((b, i) => 
                    <BankOption key={i} active={selBank === i} onClick={() => setSelBank(i)}>
                        {b && b.name}
                    </BankOption>
                )}
            </BankSelector>

            {bank && <Bank>
                <BankMain filter={selPool === false ? bank.filter : false}>
                {selPool !== false && 
                    <img src={bank.pools[selPool].image}/>
                }
                
                {selPool === false && 
                <BankImgs>
                    <BankImg src={bank.parts[3]} index={3}/>
                    <BankImg src={bank.parts[0]} animated index={0}/>
                    <BankImg src={bank.parts[1]} animated index={1}/>
                    <BankImg src={bank.parts[2]} animated index={2}/>
                    <BankImg src={bank.parts[3]} animated index={3}/>                    
                </BankImgs>
                }
                </BankMain>

                <Pools>
                    {bank.pools.map((pool, i) =>
                        <Pool key={i}>
                            {pool !== false && <img src={pool.image} onClick={() => setSelPool(i)}/>}
                            {!pool && <Mint onClick={() => account ? handleMint(selBank, i) : setConnectIntent(true)}>
                            {(minting === i) ? <Loader/> : '+'}
                            </Mint>}
                        </Pool>
                    )}
                </Pools>
            </Bank>}

            

            {/* <Banks>
            {banks && banks.map((bank, i) => {
                return <Bank open={selBank === i} key={i} onClick={() => setSelBank(i)}>
                    {bank &&
                    <BankImgs filter={bank.filter} r={(100/15 * bank.minted)}>
                        <BankImg src={bank.parts[3]} index={3}/>
                        <BankImg src={bank.parts[0]} animated index={0}/>
                        <BankImg src={bank.parts[1]} animated index={1}/>
                        <BankImg src={bank.parts[2]} animated index={2}/>
                        <BankImg src={bank.parts[3]} animated index={3}/>
                    </BankImgs>
                    }
                    <Pools>
                    {bank.pools && bank.pools.map((pool, i) => {
                        return <img src={pool.image} key={i} index={i}/>
                    })}
                    </Pools>
                </Bank>
            })}
            </Banks>
            {banks && <Modal show={selBank !== false}>
                <h1>{bank.name}</h1>
                <ModalInner>
                    You are about to mint a mempool from the {bank.name} bank.
                <ModalActions actions={[
                    {label: account ? 'Mint' : 'Connect', callback: () => account ? handleMint(selBank) : setConnectIntent(true), disabled: bank.minted >= MAX_MINTS},
                    {label: 'Close', callback: () => setSelBank(false)}
                ]}/>
                </ModalInner>
            </Modal>} */}
            {banks === false && <p>loading...</p>}
            {(banks && banks.length === 0) && <p>no banks</p>}
        </Section>
    </Page>

}