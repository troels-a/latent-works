import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled from 'styled-components';
import Page from 'templates/Page';
import 'swiper/css';
import { useState} from 'react';
import { useRouter } from 'next/dist/client/router';
import fetch from 'node-fetch';


const Section = styled.div`
margin-bottom: 2vw;
`

const WorkWrap = styled.div`
    display: flex;
`

const WorkImages = styled.div`
    position: relative;
    height: 45vw;
    width: 45vw;
`

const WorkImage = styled(({src, children, ...p}) => <img {...p} src={src}/>)`
    cursor: pointer;
    margin: 0;
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    left: 0;
    opacity: 0;
    transition: opacity 200ms 200ms;
    ${p => p.show && `
        transition: opacity 200ms 0ms;
        opacity: 1;
    `}

    ${p => p.placeholder && `
        opacity: 0.5;
        content: '';

    `}
`

const WorkDescription = styled.div`
    margin-left: 3vw;
`

const Tools = styled.small`
    display: block;
`
const Meta = styled.small`
    display: block;
`
const WorksNav = styled.nav`
    display: flex;
    justify-content: space-between;
`

const WorkNav = styled.button`
    display: inline-block;
`


export default function SeventySevenBySeven(props){

    const {query, basePath, ...router} = useRouter();
    const [workID, setWorkID] = useState(1);
    const [work, setWork] = useState(false);
    const [image, setImage] = useState(false);
    const [iteration, setIteration] = useState(1);
    const [loading, setLoading] = useState(false);


    const updateUrl = (key, value) => {
        query[key] = value;
        const urlParams = new URLSearchParams(query)
        const url = basePath+'?'+urlParams.toString();
        router.push(url, null, {shallow: true})
    }
    

    useEffect(() => {
        
        if(query.work)
            setWorkID(parseInt(query.work))
        if(query.edition)
            setIteration(parseInt(query.edition))

    }, [query]);

    useEffect(() => {
        
        async function fetchWork(){
            const response = await fetch(`/api/77x7/info/${workID}`);
            const json = await response.json();
            setWork(json);
        }

        fetchWork();
        setWork(false);
        
    }, [workID])

    useEffect(() => {
        if(work)
            setLoading(false)
        else
            setLoading(true)
    }, [work])

    const next = () => {
        
        if(loading)
            return;

        let set;
        if(workID < 77)
            set = workID+1;
        else
            set = 1;

        setWorkID(set);
        setIteration(1);
        updateUrl('edition', 1)
        updateUrl('work', set)

    }

    const prev = () => {
        
        if(loading)
            return;

        let set;
        if(workID > 1)
            set = workID-1
        else
            set = 77;

        setWorkID(set);
        setIteration(1);
        updateUrl('edition', 1)
        updateUrl('work', set)
    }

    const iterate = () => {
        let set = 1;
        if(iteration < 7)
            set = iteration+1;
        
        setIteration(set);
        updateUrl('edition', set)
    }

    return <Page>
        
        <Section dangerouslySetInnerHTML={{__html: props.content}}/>
        <Section>
        <WorksNav>
            <div>
                <WorkNav onClick={prev}>{'<<'}</WorkNav>
                <WorkNav onClick={next}>{'>>'}</WorkNav>
            </div>
        </WorksNav>
        </Section>
        <WorkWrap>
            <WorkImages onClick={iterate}>
                {work ? 
                [1,2,3,4,5,6,7].map(index => <WorkImage show={iteration == index} key={index} src={work.iterations[index-1]}/>) :
                <WorkImage placeholder={true} src="/api/77x7/image/0?edition=0&mark=false"/>
                }
            </WorkImages>
            <WorkDescription>
                {work ?
                <>
                    <h4>{work.name}</h4>
                    {iteration}/7
                </> : 
                <>
                <h4>Loading</h4>
                </>}
            </WorkDescription>
        </WorkWrap>            

    </Page>

}

export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', '77x7');
    // const works = [];
    // let i = 70;
    // while(i <= 77){

    //     works.push({
    //         id: i,
    //         title: 'Latent Work #'+i,
    //         image: `/api/77x7/image/${i}?format=svg`,
    //         image_large: `/api/77x7/image/${i}?format=svg&size=large`
    //     })

    //     i++;
    // }

    return {
        props: {
            ...content
        }
    }
}