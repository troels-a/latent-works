import Section from "components/Section/Section";
import { useTheme } from "styled-components";
import Page from "templates/Page";
import MEMPOOLS_ABI from "@lw/contracts/abi/LWMempools.json"
import useContract from "hooks/useContract";

import Button from "components/Button";

export default function Mempools_index(){


    const mempools = useContract({
        address: process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS,
        abi: MEMPOOLS_ABI,
        endpoint: '/api/mempools'
    });

    async function handleMint(){
        const price = await mempools.read('PRICE').then(res => res.result);
        await mempools.write('mint', false, {value: price});
    }


    return <Page>
        <Section>
            <Button onClick={handleMint}>Mint</Button>
            <img src="/mempool.svg"/>
        </Section>
    </Page>

}