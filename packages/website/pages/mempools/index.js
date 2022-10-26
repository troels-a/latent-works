import Section from "components/Section/Section";
import styled, { css, keyframes, useTheme } from "styled-components";
import Page from "templates/Page";
import MEMPOOLS_ABI from "@lw/contracts/abi/LWMempools.json"
import useContract from "hooks/useContract";
import {ethers} from 'ethers';
import { getEntryBySlug } from "base/contentAPI";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState, useRef } from "react";
import { useConnectIntent } from "components/ConnectButton";
import Loader from "components/Loader";
import Grid from "styled-components-grid";
import {breakpoint} from "styled-components-breakpoint";
import { useLTNT } from "components/LTNT/Provider";
import Modal, { ModalInner, ModalActions } from "components/Modal";
import Countdown from "react-countdown";
import Button from "components/Button";

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
    align-items: center;
    align-content: center;
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

const mainWidth = 37.46;

export default function Mempools_index({page, ...p}){
    
    const {account, provider} = useWeb3React();
    const [banks, setBanks] = useState();
    const [selBank, setSelBank] = useState(false);
    const [bank, setBank] = useState(false);
    const [selPool, setSelPool] = useState(false);
    const {setConnectIntent} = useConnectIntent();
    const [minting, setMinting] = useState(false);
    const [mintPool, setMintPool] = useState(false);
    const [hasStamp, setHasStamp] = useState(false);
    const [pools, setPools] = useState({});
    const [contractBalance, setContractBalance] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [withdrawTo, setWithdrawTo] = useState(false);
    const wdRef = useRef();

    const LTNT = useLTNT();

    const mempools = useContract({
        address: process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS,
        abi: MEMPOOLS_ABI,
        endpoint: '/api/mempools'
    });


    async function fetchContractBalance(){
        let balance = await fetch(`/api/balance?address=${process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS}`).then(res => res.json());
        console.log(balance)
        setContractBalance(balance);
    }

    async function fetchAdmin(){
        let admin = await mempools.read('owner').then(res => res.result);
        console.log(admin)
        setIsAdmin(admin.toLowerCase() === account.toLowerCase());
    }

    async function handleWithdraw(){
        await mempools.write('withdrawAllTo', {to_: withdrawTo});
    }

    async function handleMint(bank_index, index){
        setMinting(index);
        try {
            const price = await mempools.read('PRICE').then(res => res.result);

            let tx;
            if(LTNT.picked > 0 && !hasStamp)
                tx = await mempools.contract.mintWithLTNT(LTNT.picked, bank_index, index, {value: ethers.utils.parseEther('0.1')});
            else
                tx = await mempools.contract.mint(bank_index, index, {value: ethers.BigNumber.from(price.hex)});
            await tx.wait();
            await updateBank(bank_index);
        }
        catch(e){
            console.log(e)
            setMinting(false);
        }
        setMinting(false);
        setMintPool(false);
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
            let image = await mempools.read('getPoolImage', {pool_id_: pool_id, encode_: true}).then(res => res.result);
            setPools(oldPools => {
                const newPools = {...oldPools};
                newPools[pool_id] = {image, bank_index, pool_index};
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
        fetchBanks();
    }, []);

    useEffect(() => {
        if(account)
            fetchAdmin();
    }, [account])

    useEffect(() => {
        if(isAdmin)
            fetchContractBalance();
    }, [isAdmin])

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
        if(banks){
            for (let i = 0; i < banks.length; i++) {
                const bank = banks[i];
                populatePools(i, false);
            }
        }
    }, [banks])

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
            {isAdmin && <div>
                Hello admin! 
                {contractBalance && <> You have {contractBalance} ETH in the contract. Withdraw to <input type="text" ref={wdRef} onChange={e => setWithdrawTo(e.target.value)}/><Button onClick={() => handleWithdraw()}>Withdraw to {withdrawTo}</Button></>}
            </div>}
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

                    {(selPool !== false && pools[banks[selBank].pools[selPool]]) && 
                        <img src={pools[banks[selBank].pools[selPool]].image}/>
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
                                {!pool && <Mint onClick={() => account ? setMintPool(i) : setConnectIntent(true)}>
                                {(minting === i) ? <Loader/> : '+'}
                                </Mint>}
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
                    <Countdown date={1666818000000} renderer={({
                    total
                }) => {
                    return <h1 style={{minWidth: '100%', textAlign: 'center'}}>{total/1000}</h1>
                    // return <p>{days > 0 && `${days} day${days > 1 && 's'}${minutes > 0 ? ',' : ' and'} `}{hours > 0 && `${hours} hour${hours > 1 ? 's' : ''}`}{minutes > 0 && ` and ${minutes} minute${minutes > 1 ? 's' : ''}`}</p>
                }}>
                    <p style={{minWidth: '100%', textAlign: 'center'}}><Loader>Loading banks</Loader><br/>
                    <small>Please reload the page if this takes too long</small>
                    </p>
                </Countdown>

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

        <Modal show={mintPool !== false}>
            {mintPool !== false && 
            <ModalInner>
            <>You're about to generate and mint a pool from bank "{banks[selBank].name}" at slot index {mintPool}. </>

            {(LTNT.picked && !hasStamp) && <Notice>You have activated LTNT #{LTNT.picked} for this mint and the price is reduced to 0.1 ETH</Notice>}
            {(LTNT.picked && hasStamp) && <Notice>You have activated LTNT (#{LTNT.picked}) - it is already stamped by Mempools and will be ignored</Notice>}
            {(LTNT.balance && !LTNT.picked) && <Notice>You have LTNT in your wallet and by <a href="#" onClick={e => {e.preventDefault(); LTNT.setIsPicking(true); setMintPool(false)}}>picking</a> one to stamp, you might be able to mint at a reduced price</Notice>}

            <ModalActions actions={[
                {label: 'Cancel', callback: () => setMintPool(false)},
                {label: minting ? <Loader>Minting</Loader> : `Mint (${(LTNT.picked && !hasStamp) ? '0.1' : '0.15'} ETH)`, disabled: minting, callback: () => {!minting && handleMint(selBank, mintPool);}},
            ]}/>
            </ModalInner>
            }
        </Modal>
    

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