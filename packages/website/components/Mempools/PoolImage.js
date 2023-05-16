// All imports
import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useMempool} from 'hooks/useMempool';
import Loader from 'components/Loader/Loader';

const Progress = styled(p => {
    return <div {...p}><div></div></div>
})`
    height: 0.5rem;
    background-color: ${p => p.theme.colors.emph9};
    overflow: hidden;
    position: relative;
    > div {
        height: 100%;
        background-color: ${p => p.theme.colors.emph8};
        position: absolute;
        top: 0;
        left: 0;
        width: ${p => (p.value/p.max)*100}%;
    }
`

const Left = styled.small`
user-select: none;
    cursor: pointer;
    position: relative;
    em {
        position: absolute;
        font-size: 0.6em;
        top: -1.1em;
        right: 0;
    }
`

const PoolStats = styled(({id, ...p}) => {

    const {loading, error, ...mempool} = useMempool(id);
    const [left, setLeft] = useState(0)
    const [format, setFormat] = useState('seconds')

    useEffect(() => {
        if(loading) 
            setLeft(0)
    }, [loading])

    useEffect(() => {
        if(!loading && mempool.epoch_remaining) {
            
            setLeft(mempool.epoch_remaining)
            
            let timing = 1000;
            if(format === 'minutes')
                timing = 1000*60;
            else if(format === 'hours')
                timing = 1000*60*60;
            else if(format === 'days')
                timing = 1000*60*60*24;            

            const interval = setInterval(() => {
                setLeft(left => left - 1)
            }, timing)

            return () => {
                clearInterval(interval)
                setLeft(0)
            }

        }
    }, [loading, mempool.epoch_remaining, format])
    

    const shiftFormat = () => {
        if(format === 'seconds')
            setFormat('minutes')
        else if(format === 'minutes')
            setFormat('hours')
        else if(format === 'hours')
            setFormat('days')
        else if(format === 'days')
            setFormat('seconds')
    }

    const formatSeconds = (seconds) => {
        if(format === 'seconds')
            return seconds
        else if(format === 'minutes')
            return Math.round(seconds/60);
        else if(format === 'hours')
            return Math.round(seconds/60/60);
        else if(format === 'days')
            return Math.round(seconds/60/60/24);
    }


    return <div {...p}>
        {loading && <small><Loader></Loader></small>}
        {error && <small>Error fetching stats</small>}
        {!loading && <div>
            
            <div style={{display: 'flex', placeContent: 'space-between'}}>
                <small style={{position: 'absolute', top: '0.5em', left: '0.5em'}}>#{id}</small>
                <small>{`+`.repeat(mempool.epoch)}</small>
                <Left onClick={e => shiftFormat()}>
                    <em>{left > 0 && format}</em>
                    {left > 0 && formatSeconds(left)}
                </Left>
                {/* Epoch length: {moment.duration(mempool.epoch_length, "seconds").humanize(humanizeProps)}
                Next epoch begins in {moment.duration(mempool.epoch_remaining, "seconds").humanize(humanizeProps)} */}
            </div>
            <Progress value={mempool.epoch_length - left} max={mempool.epoch_length}></Progress>

        </div>}
    </div>
})`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    min-width: 100%;
    padding: 0.5em 0.5em 0.8em 0.5em;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    background-color: transparent;
    color: ${p => p.theme.colors.txt};
    box-sizing: border-box;
    > div {
        flex: 1;
        min-width: 100%;
    }
`

const Wrapper = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    ${p => p.clickable && `
        cursor: pointer;
    `}
`

export default function PoolImage({id, stats, ...p}) {

    const {loading, error, image} = useMempool(id);

    return <Wrapper {...p}>
        {stats && <PoolStats id={id} />}
        <img src={image}/>
    </Wrapper>
    
}