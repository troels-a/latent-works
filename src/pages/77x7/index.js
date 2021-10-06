import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import Page from 'templates/Page';

export default function SeventySevenBySeven(props){

    const { activate, active, account, library, chainId} = useWeb3React();

    return <Page>
        
        {props.works.map(work => <div style={{display: 'flex'}}>
            {[1,2,3,4,5,6,7].map(iteration => <div style={{width: '14.2%'}}>
            <img src={`${work.image}&edition=${iteration}`}></img>   
            </div>
            )}
        </div>)}

    </Page>

}

export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', '77x7');
    const works = [];
    let i = 70;
    while(i <= 77){

        works.push({
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