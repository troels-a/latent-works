import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Page from 'templates/Page';
import { useState} from 'react';
import { useRouter } from 'next/dist/client/router';
import fetch from 'node-fetch';
import { useRef } from 'react';
import Link from 'next/link';
import {breakpoint} from 'styled-components-breakpoint';

const Section = styled.div`
    margin-bottom: 2vw;
`

const WorkWrap = styled.div`
    display: flex;

    ${breakpoint('sm', 'md')`
        flex-direction: column;
    `}

`

const WorkImages = styled.div`
    position: relative;
    height: 45vw;
    width: 45vw;
    ${breakpoint('sm', 'md')`
        width: 100%;
        height: 100vw;
    `}
`

const WorkImage = styled(({src, children, placeholder, show, ...p}) => <img {...p} src={src}/>)`
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

    ${p => p.placeHolder && `
        opacity: 0.5;
        content: '';

    `}
`

const WorkDescription = styled.div`
    margin-left: 3vw;
    display: flex;
    flex-direction: column;
    ${breakpoint('sm', 'md')`
        width: 100%;
        margin: 0;
    `}
`

const Tools = styled.small`
    display: block;
`
const Meta = styled.small`
    display: block;
`
const WorksNav = styled.nav`
    display: flex;
    justify-content: flex-start;
    ${breakpoint('sm', 'md')`
        justify-content: space-between;
        margin-bottom: 6vw;
    `}
`

const WorkNav = styled.button`
    display: inline-block;
    ${breakpoint('sm', 'md')`

        &:last-of-type {
            order: 3;
        }

    `}
`

const blink = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`

const Prompt = styled(({symbol, className, key, ...p}) => <div className={className} key={key}>
    <input {...p}/>
    <span>{symbol}</span>
</div>)`

    position: relative;

    > input {
        padding-left: 1vw;
    }
    > input:focus + span {
        animation: ${blink} 500ms infinite;
    }
    > span {
        position: absolute;
        left: 0;
        top: 1vw;
        display: inline-block;
        width: 0;
    }
`

const Minters = styled.div`


`


export default function SeventySevenBySeven(props){

    const {query, basePath, ...router} = useRouter();
    const [workID, setWorkID] = useState(1);
    const [work, setWork] = useState(false);
    const [iteration, setIteration] = useState(1);
    const [loading, setLoading] = useState(false);
    const [autoplay, setAutoplay] = useState(false);


    function updateUrl(key, value){
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


    // Nav functions
    let navTimeout = false;

    function next(){

        let set;
        if(workID < 77)
            set = workID+1;
        else
            set = 1;

        if(navTimeout)
            clearTimeout(navTimeout);
            
        navTimeout = setTimeout(() => {
            updateUrl('edition', 1)
            updateUrl('work', set)    
        }, 300);

    }

    function prev() {

        let set;
        if(workID > 1)
            set = workID-1
        else
            set = 77;

        if(navTimeout)
            clearTimeout(navTimeout);
            
        navTimeout = setTimeout(() => {
            updateUrl('edition', 1)
            updateUrl('work', set)    
        }, 300);

    }

    function iterate(){

        let set = 1;
        if(iteration < 7)
            set = iteration+1;
        
        updateUrl('edition', set)

    }

    let timeout = false;
    function onPromptID(e){

        if(timeout)
            clearTimeout(timeout);
        const val = parseInt(e.currentTarget.value);

        if(val){
            timeout = setTimeout(() => {
                if(val > 0 && val <= 77){
                    updateUrl('work', val);
                    updateUrl('edition', 1);
                }
            }, 1000)
        }
        else {
            clearTimeout(timeout);
        }
    }
    

    return <Page>
        
        <Section dangerouslySetInnerHTML={{__html: props.content}}/>
        <Section>
        <WorksNav>
            <WorkNav onClick={prev}>{'<<'}</WorkNav>
            <WorkNav onClick={next}>{'>>'}</WorkNav>
            <div>
            <Prompt type="text" symbol="#" onChange={onPromptID}/>
            </div>
        </WorksNav>
        </Section>
        <WorkWrap>
            <WorkImages onClick={iterate}>
                {work ? 
                [1,2,3,4,5,6,7].map(index => <WorkImage show={iteration == index} key={index} src={work.iterations[index-1]}/>) :
                <WorkImage placeHolder={true} src="/api/77x7/image/0?edition=0&mark=false"/>
                }
            </WorkImages>
            <WorkDescription>
                {work ?
                <>
                    <h4>{work.name}</h4>
                    <p>Edition {iteration}/7</p>
                    <hr/>
                    <small><strong>Minters</strong></small>
                    <Minters>{work.minters.map(minter => <small>{minter}<br/></small>)}</Minters>
                    <hr/>
                    <Link href={`https://opensea.io/assets/${process.env.NEXT_PUBLIC_CONTRACT}/${workID}`} passHref>
                        <a>Opensea</a>
                    </Link>
                </> : 
                <>
                <h4>Loading...</h4>
                </>}
            </WorkDescription>
        </WorkWrap>            

    </Page>

}

export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', '77x7');

    return {
        props: {
            ...content
        }
    }
}