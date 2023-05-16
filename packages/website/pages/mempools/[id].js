import { getProvider } from '@lw/website/base/provider';
import mempools_abi from '@lw/contracts/abi/LWMempools.json';
import { ethers } from "ethers";
import Page from 'templates/Page';
import Section from 'components/Section/Section';
import Grid from 'styled-components-grid';
import PoolImage from 'components/Mempools/PoolImage';
import FlexImg from 'components/FlexImg';
import styled from 'styled-components';
import Link from 'next/link';
import Filters from 'components/Mempools/Filters';

function bankToObject(bank){
    return {
        name: bank._name,
        parts: bank._parts,
        filter: bank._filter,
        pools: bank._pools.map(p => p.toNumber()),
    }
}

const PartImage = styled(({src, ...p}) => {
    return <div {...p}>
        <FlexImg src={src} />
    </div>
})`
    box-sizing: border-box;
    width: 100%;
    background-color: ${p => p.theme.colors.emph2};
    opacity: 0.5;
    overflow: hidden;
    > img {
        filter: url(#${p => p.filter}) blur(25px);
    }
    ${p => p.current && `
        opacity: 1;
        background-color: ${p.theme.colors.emph6};
        > img {
            filter: url(#${p => p.filter});
        }
    `}

`

const OtherPoolImage = styled(PoolImage)`
    ${p => p.current && `
        position: relative;
        z-index: 1;
        overflow: visible;
        &:before {
            content: '·';
            display: block;
            position: absolute;
            top: -1em;
            left: 0;
            right: 0;
            z-index: 10;
            color: ${p.theme.colors.text};
            text-align: center;
        }

    `}
`

const PoolInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    > div {
        width: 100%;
    }
`

export default function Mempool({id, image, bank, part, part_index, seed, epoch_length, current_epoch}) {
    return <Page theme="dark">
        <Filters />
        <Section>
            <Grid>
                <Grid.Unit size={1/2}>
                    <PoolImage id={id} stats/>
                </Grid.Unit>        
                <Grid.Unit size={1/2} as={PoolInfo}>
                    <Grid>
                    {bank.parts.map((p, i) => <Grid.Unit size={1/4} key={i}>
                        <PartImage filter={bank.filter} src={p} current={i == part_index} />
                    </Grid.Unit>)}
                    </Grid>
                    <Grid>
                        {bank.pools.map((p, i) => <Grid.Unit size={1/15} key={i}>
                            <Link href={`/mempools/${p}`}>
                                <OtherPoolImage id={p} current={p == id} clickable/>
                            </Link>
                        </Grid.Unit>)}
                    </Grid>
                </Grid.Unit>
            </Grid>
        </Section>

    </Page>
}

export async function getStaticProps({params}){
    
    // Get the ID from the request
    const {id} = params;
    if(id < 1 || id > 225){
        return {
            notFound: true,
        }
    }

    const provider = getProvider();
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS, mempools_abi, provider);

    const image = await contract.getPoolImage(id, true);
    const bank = await contract.getPoolBank(id).then(bankToObject);
    const part = await contract.getPoolPart(id).then((p) => p.toString());
    const part_index = await contract.getPoolPartIndex(id).then((i) => i.toNumber());
    const seed = await contract.getPoolSeed(id, '');
    const epoch_length = await contract.getEpochLength(id).then((l) => l.toNumber());
    const current_epoch = await contract.getCurrentEpoch(id).then((e) => e.toNumber());

    return {
        props: {
            id,
            image,
            bank,
            part,
            part_index,
            seed,
            epoch_length,
            current_epoch,
        },
        revalidate: 10,
    }
    
}

export async function getStaticPaths(){
    return {
        paths: Array.from(Array(225).keys()).map((i) => i+1).map((i) => ({params: {id: i.toString()}})),
        fallback: 'blocking',
    }
}