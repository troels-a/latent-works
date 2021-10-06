import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import Page from 'templates/Page';
import Link from 'next/link';
import styled from 'styled-components';

const Work = styled.a`
    display: flex;
    width: 100%;
    height: 9.35vw;
    cursor: pointer;
    > div {
        width: 14.2%;
    }
`

export default function SeventySevenBySeven(props){

    const { activate, active, account, library, chainId} = useWeb3React();

    return <Page>
        <div dangerouslySetInnerHTML={{__html: props.content}}/>
        {props.works.map((work, index) => <Link href={`/77x7/${work.id}`} key={index} passHref><Work>
            {[1,2,3,4,5,6,7].map(iteration => <div>
            <img src={`${work.image}&edition=${iteration}`}></img>   
            </div>
            )}
        </Work></Link>)}

    </Page>

}

export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', '77x7');
    const works = [];
    let i = 1;
    while(i <= 77){

        works.push({
            id: i,
            title: 'Latent Work #'+i,
            image: `/api/77x7/image/${i}?format=svg`,
            image_large: `/api/77x7/image/${i}?format=svg&size=large`
        })

        i++;
    }

    return {
        props: {
            works: works,
            ...content
        }
    }
}