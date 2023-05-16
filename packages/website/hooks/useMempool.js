import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ethers } from 'ethers';

const fetcher = (...args) => fetch(...args).then(res => res.json()).then(res => res.result).then(res => {
    
    // if bignumber convert to number
    if(res && res.hex){
        res = ethers.BigNumber.from(res.hex).toNumber();
    }
    // If string ends with ___, remove it and convert to number
    else if(res && res.endsWith('___')){
        res = res.slice(0, -3);
    }
    
    return res;

})

export function useMempool(id){
    

    const [loading, setLoading] = useState(true);
    const [timestamp, setTimestamp] = useState(null);
    const [epoch_remaining, setEpochRemaining] = useState(null);
    const [next_epoch, setNextEpoch] = useState(null);
    const seed = useSWR(`/api/mempools/getPoolSeed?pool_id_=${id}&append_=___`, fetcher)
    const epoch_length = useSWR(id ? `/api/mempools/getEpochLength?pool_id_=${id}` : null, fetcher)
    const epoch = useSWR(id ? `/api/mempools/getCurrentEpoch?pool_id_=${id}` : null, fetcher)
    const image = useSWR(id ? `/api/mempools/getPoolImage?pool_id_=${id}&encode_=true` : null, fetcher)

    useEffect(() => {
        if(seed.data){
            const sliceLength = `${id}`.length;
            // Get timestamp by removing id and _ from end of seed string
            const ts = `${seed.data}`.slice(0, -sliceLength);
            setTimestamp(parseInt(ts));
        }
    }, [seed.data])


    useEffect(() => {
        
        if(
            timestamp
            &&
            epoch_length.data
            &&
            epoch.data
        ){
            const next_epoch = timestamp + (epoch_length.data * epoch.data);
            const epoch_remaining = Math.round(next_epoch - (Date.now() / 1000));
            setEpochRemaining(epoch_remaining);
            setNextEpoch(next_epoch);
        }

        return () => {
            setEpochRemaining(null);
            setNextEpoch(null);
        }

    }, [timestamp, epoch_length, epoch])


    useEffect(() => {
        if(!loading && !epoch_remaining){
            setLoading(true);
        }
        else if(loading && epoch_remaining){
            setLoading(false);
        }
    }, [epoch_remaining, loading])

    return {
        timestamp,
        epoch_length: epoch_length.data,
        epoch : epoch.data,
        epoch_remaining,
        next_epoch,
        image: image.data,
    };

}