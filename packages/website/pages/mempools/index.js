import Section from "components/Section/Section";
import { useTheme } from "styled-components";
import Page from "templates/Page";
import MEMPOOLS_ABI from "@lw/contracts/abi/LWMempools.json"
import useContract from "hooks/useContract";
import {ethers} from 'ethers';

import Button from "components/Button";
import { useWeb3React } from "@web3-react/core";

export default function Mempools_index(){


    const {account} = useWeb3React();

    const mempools = useContract({
        address: process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS,
        abi: MEMPOOLS_ABI,
        endpoint: '/api/mempools'
    });

    async function handleMint(){
        const price = await mempools.read('PRICE').then(res => res.result);
        await mempools.contract.mint(0, {value: ethers.BigNumber.from(price.hex)});
    }

    

    return <Page bgImage="/mempool.svg" txtColor="white">
        <Section>
            <h1>Mempools</h1>
        </Section>
        <Section $large>
            <p>
                The mountain grass<br/>cannot but keep the form<br/>
                where the mountain hare has lain
            </p>
        </Section>
        <Section width={30}>
        Keep it simple hero message interstitial. Accessibility mobile coach marks design by committee portfolio. Modern portfolio retina sidebar branding. Braindump sketch classical conditioning css3 mobile. Hierarchy storyboard post-its design by committee. Contextual inquiry hero message. Wireframe rule of thirds usability testing iconography responsive. Typeface iconography sans-serif sidebar rounded corners. Branding storyboard grouping.

Front-end golden ratio. Gradient dribble header headroom. Dieter rams drop down modular scale. Iconography omnigraffle site map objectified keep it simple. Baseline portfolio baseline. Prägnanz 66-character line. Scenario glyph. Hierarchy branding. Prägnanz prototype descender helvetica bevel. Contrast oblique. Responsive usability. Icon prägnanz.
        </Section>
        <Section>
        <Button disabled={!account} invertColors onClick={handleMint}>Mint</Button>
        </Section>
    </Page>

}