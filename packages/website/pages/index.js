import { getEntryBySlug } from "base/contentAPI";
import Section from "components/Section/Section";
import {breakpoint} from "styled-components-breakpoint";
import Grid from "styled-components-grid";
import Page from "templates/Page"
import styled from "styled-components";
import Link from "next/link";
import theme from 'base/style'

const HeaderSection = styled(Section)`

    ${breakpoint('md')`
        max-width: 60%;
        margin: 0 auto;
    `}

`

const projectStyle = {display: 'flex', placeContent: 'center'};

export default function Home({pageIndex, ...p}){

    return <Page $centerContent>

        <HeaderSection dangerouslySetInnerHTML={{__html: pageIndex.content}}/>
        <Section>
        <Grid>
            <Grid.Unit style={projectStyle}><h2>SERIES</h2></Grid.Unit>
            <Grid.Unit style={projectStyle} size={{sm: 1/1, md: 6/12}}>
                <Link href="/77x7">77x7</Link>
            </Grid.Unit>
            <Grid.Unit style={projectStyle} size={{sm: 1/1, md: 6/12}}>
                <Link href="/00x0">00x0</Link>
            </Grid.Unit>
            <Grid.Unit>
                <Section style={projectStyle}>
                    <Link href="https://t.co/qRrVVkm0Rh">
                        <a target=""_blank>
                            Discord
                        </a>
                    </Link>
                    ·
                    <Link href="https://twitter.com/latent_works">
                        <a target=""_blank>
                            Twitter
                        </a>
                    </Link>
                    
                </Section>
            </Grid.Unit>
        </Grid>
        </Section>
    </Page>

}



export async function getStaticProps(){
    
    const pageIndex = await getEntryBySlug('pages', 'index');

    return {
        props: {
            pageIndex: pageIndex
        }
    }
}