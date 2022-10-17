import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import Page from 'templates/Page';
import { useState} from 'react';
import { useRouter } from 'next/dist/client/router';
import fetch from 'node-fetch';
import { useRef } from 'react';
import Link from 'next/link';
import {breakpoint} from 'styled-components-breakpoint';
import Grid from 'styled-components-grid/dist/cjs/components/Grid';
import GridUnit from 'styled-components-grid/dist/cjs/components/GridUnit';
import theme from 'base/style';
import { useWeb3React } from '@web3-react/core';
import useInterval from 'base/useInterval';
import WorkDisplay from 'components/WorkDisplay'
import useWork, { WorkProvider } from 'hooks/useWork';
import { useSwipeable } from 'react-swipeable';
import { GrPowerCycle, GrNext, GrPrevious } from 'react-icons/gr';
import Section from 'components/Section/Section';

const WorkWrap = styled.div`
    display: flex;

    ${breakpoint('sm', 'md')`
        flex-direction: column;
    `}

`


const WorkDescription = styled.div`
    padding: 2vw;
    display: flex;
    flex-direction: column;
    background-color: ${p => p.theme.colors.emph2};
    min-height: 22vw;
    ${breakpoint('sm', 'md')`
        width: 100%;
        padding: 4vw;
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
        // justify-content: space-between;
        margin-bottom: 6vw;
    `}
`

const WorkNav = styled(({prev, next, ...p}) => <a {...p}>{prev ? <GrPrevious className='icon'/> : <GrNext className='icon'/>}</a>)`

    padding: 0em 0em 0em 1em;
    cursor: pointer;
    font-size: 0.8em;
    position: relative;
    top: 0.18em;
    opacity: 0.7;
    transition: opacity 200ms;
    color: ${p => p.theme.colors.main};
    &:hover {
        opacity: 1;
    }

    ${breakpoint('sm', 'md')`
        top: 0.35em;
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

const Prompt = styled(({append, prepend, animatePrepend, className, key, inputRef, ...p}) => <span className={className} key={key} {...p}>
    {prepend && <span>{prepend}</span>}
    <input ref={inputRef} {...p}/>
    {append && <span>{append}</span>}
</span>)`

    position: relative;
    font-size: 1em;
    
    > input {
        display: inline-block;
        padding: 0;
        border: 0!important;
        width: 1em;
        padding: 0!important;
        color: inherit;
    }

    > span {
        position: relative;
        display: inline-block;
        ${p => p.animatePrepend && css`animation: ${blink} 500ms infinite;`}
    }


    ${breakpoint('sm', 'md')`
    margin: 0 auto;
    `}

`

const Minters = styled.div`


`

const MinterLink = styled.a`
    display: block;
    text-decoration: none;
    color: ${p => p.$active ? p.theme.colors.main : p.theme.colors.main_dimmed};
    &:hover {
        color: ${p => p.theme.colors.main};
    }

`


const Rotate = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`

const CycleIcon = styled(GrPowerCycle)`
    position: relative;
    top: 0.15em;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 200ms;
    &:hover {
        opacity: 1;
    }
    ${p => p.rotate && css`animation: ${Rotate} 2500ms infinite`}
`

let navTimeout = false;

function SeventySevenBySeven(props){

    
    const {query, basePath, ...router} = useRouter();
    const [workID, setWorkID] = useState(false);
    const work = useWork();
    const [iteration, setIteration] = useState(false);
    const [autoplay, setAutoplay] = useState(false);
    const [loadingID, setLoadingID] = useState(false);
    const [typing, setTyping] = useState(false);
    
    useInterval(() => {
        iterate()
    }, autoplay ? 2000 : null);

    const promptID = useRef();

    const {
        active,
        library,
        account,
    } = useWeb3React()


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
            if(edition > 0 && edition <= 7){
                setIteration(edition)
            }
        }
        else{
            setIteration(1);
        }

    }, [query]);



    useEffect(() => {
        if(work && promptID.current)
            promptID.current.value = work.id;
    }, [work]);

    useEffect(() => {
        if(promptID.current && loadingID)
            promptID.current.value = loadingID;
    }, [loadingID])


    const swipeHandlers = useSwipeable({
        onSwipedLeft: (eventData) => prev(),
        onSwipedRight: (eventData) => next()
    });

    // Nav functions
    function _goTo(to){
        
        setLoadingID(to)
        setAutoplay(false)

        updateUrl('edition', 1)
        updateUrl('work', to)

    }

    function next(){

        let set;
        if(loadingID < 77)
            set = loadingID+1;
        else
            set = 1;

        _goTo(set)

    }

    function prev() {
        
        let set;
        if(loadingID > 1)
            set = loadingID-1
        else
            set = 77;

        _goTo(set)

    }


    const iterate = () => {
        
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
    

    const toggleAutoPlay = () => {
        setAutoplay(!autoplay);
    }

    return <Page>
        <Grid>
            <GridUnit size={{sm: 1/1, md: 1/2}}>
                <WorkDisplay iteration={iteration} {...swipeHandlers} onClick={iterate}/>
            </GridUnit>            
            <GridUnit size={{sm: 1/1, md: 1/2}}>

                <WorkDescription>
                    
                    <WorksNav>
                        <h4>
                        Work <Prompt type="text" prepend="#" animatePrepend={!(loadingID == work.id)} inputRef={promptID} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} onChange={onPromptID}/>
                        </h4>
                        <WorkNav prev onClick={prev}/>
                        <WorkNav next onClick={next}/>
                    </WorksNav>
                    
                    {work &&
                    <>
                        
                        <small>
                            Iteration {iteration}/7 <CycleIcon rotate={autoplay} onClick={event => {event.preventDefault(); toggleAutoPlay()}}/>
                        </small>
                        <hr/>
                        <Minters>{work.minters.map((minter, index) => <MinterLink href="#" $active={(index+1 == iteration)} onClick={(event) => {event.preventDefault(); autoplay && toggleAutoPlay(); updateUrl('edition', index+1)}}><small>{index+1}. {work.colors[index]}</small></MinterLink>)}</Minters>
                        <hr/>
                        <Link href={`https://opensea.io/assets/${process.env.NEXT_PUBLIC_ADDRESS_77X7}/${workID}`} passHref>
                            <a>Opensea</a>
                        </Link>
                        <Link href={`https://looksrare.org/collections/${process.env.NEXT_PUBLIC_ADDRESS_77X7}/${workID}`} passHref>
                            <a>Looksrare</a>
                        </Link>
                    </>}

                </WorkDescription>

                <Section $small dangerouslySetInnerHTML={{__html: props.page77.content}}/>

            </GridUnit>

        </Grid>
    </Page>

}

export async function getStaticProps(){
    
    const page77 = await getEntryBySlug('pages', '77x7');
    const pageIndex = await getEntryBySlug('pages', 'index');

    return {
        props: {
            page77: page77,
            pageIndex: pageIndex
        }
    }
}


export default function Component(props){

    const {query, basePath, ...router} = useRouter();

    return (
        
        <WorkProvider workID={query.work ? query.work : 1}>
            <SeventySevenBySeven {...props}/>
        </WorkProvider>
    
    )
}