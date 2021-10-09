import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import Page from 'templates/Page';
import { useState} from 'react';
import { useRouter } from 'next/dist/client/router';
import fetch from 'node-fetch';
import { AbortController } from "node-abort-controller";
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
        opacity: 0.2;
        &:before {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: block;
            content: '';
            background-color: ${p.theme.colors.text};
        }
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

const Prompt = styled(({append, prepend, className, key, inputRef, ...p}) => <div className={className} key={key} {...p}>
    {prepend && <span>{prepend}</span>}
    <input ref={inputRef} {...p}/>
    {append && <span>{append}</span>}
</div>)`

    position: relative;
    font-size: 1.5em;
    
    > input {
        display: inline-block;
        padding: 0.3em 0;
        border: 0!important;
        width: 2em;
    }

    > span {
        top: 0.3em;
        display: inline-block;
        ${p => p.animatePrepend && css`animation: ${blink} 500ms infinite;`}
    }


    ${breakpoint('sm', 'md')`
    margin: 0 auto;
    `}

`

const Minters = styled.div`


`

let navTimeout = false;

export default function SeventySevenBySeven(props){

    const {query, basePath, ...router} = useRouter();
    const [workID, setWorkID] = useState(false);
    const [work, setWork] = useState(false);
    const [iteration, setIteration] = useState(false);
    const [loadingID, setLoadingID] = useState(false);
    const [autoplay, setAutoplay] = useState(false);
    const [typing, setTyping] = useState(false);

    const promptID = useRef();

    function updateUrl(key, value){
        query[key] = value;
        const urlParams = new URLSearchParams(query)
        const url = basePath+'?'+urlParams.toString();
        router.push(url, null, {shallow: true})            
    }

    useEffect(() => {
        
        if(query.work){
            const work = parseInt(query.work);
            if(work > 0 && work <= 77){
                setLoadingID(work);
                setWorkID(work);
            }
        }
        else{
            setLoadingID(1);
            setWorkID(1);
        }
        if(query.edition){
            const edition = parseInt(query.edition);
            if(edition > 0 && edition <= 7)
                setIteration(parseInt(edition))
        }
        else{
            setIteration(1);
        }

    }, [query]);

    useEffect(() => {
        
        if(workID){
        
            async function fetchWork(){
                try{
                    const response = await fetch(`/api/77x7/info/${workID}`);
                    const json = await response.json();
                    setWork(json); 
                }
                catch(e){
                    console.log(e)
                }   
            }

            fetchWork();

        }
        
    }, [workID])


    useEffect(() => {
        if(promptID.current && loadingID)
            promptID.current.value = loadingID;
    }, [loadingID])


    // Nav functions

    function next(){

        if(navTimeout)
            clearTimeout(navTimeout);

        let set;
        if(loadingID < 77)
            set = loadingID+1;
        else
            set = 1;
        
        setLoadingID(set)

        navTimeout = setTimeout(() => {
            updateUrl('edition', 1)
            updateUrl('work', set)
            console.log('Update nav', set)

        }, 500);

    }

    function prev() {
        
        if(navTimeout)
            clearTimeout(navTimeout);

        let set;
        if(loadingID > 1)
            set = loadingID-1
        else
            set = 77;

        setLoadingID(set)

        navTimeout = setTimeout(() => {
            updateUrl('edition', 1)
            updateUrl('work', set)  
            console.log('Update nav', set)
        }, 500);

    }

    function iterate(){

        let set = 1;
        if(iteration < 7)
            set = iteration+1;
        
        updateUrl('edition', set)

    }

    function onPromptID(e){

        const val = parseInt(e.currentTarget.value);
        if(!(val && val > 0 && val <= 77)){
            return false;
        }
    
        if(navTimeout)
            clearTimeout(navTimeout);
        
        setLoadingID(val)
        navTimeout = setTimeout(() => {
            updateUrl('work', val);
            updateUrl('edition', 1);
        }, 1000)

    }
    

    return <Page>
        
        <Section dangerouslySetInnerHTML={{__html: props.content}}/>
        <Section>
        <WorksNav>
            <WorkNav onClick={prev}>{'<<'}</WorkNav>
            <WorkNav onClick={next}>{'>>'}</WorkNav>
            <div>
            <Prompt type="text" prepend="LOAD#" animatePrepend={!(loadingID == work.id)} inputRef={promptID} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} onChange={onPromptID}/>
            </div>
        </WorksNav>
        </Section>
        <WorkWrap>
            <WorkImages placeHolder={true}  onClick={iterate}>
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