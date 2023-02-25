import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { ethers } from 'ethers';

const fetcher = (...args) => fetch(...args).then(res => res.json())

export function useMempool(id){
    
    const [mempool, setMempool] = useState({loading: true});

    const seed = useSWR(`/api/mempools/getPoolSeed?pool_id_=${id}&append_=_`, fetcher)
    const epoch_length = useSWR(id ? `/api/mempools/getEpochLength?pool_id_=${id}` : null, fetcher)
    const epoch = useSWR(id ? `/api/mempools/getCurrentEpoch?pool_id_=${id}` : null, fetcher)
    
    useEffect(() => {
        if(id)
            setMempool(prev => {
                return {loading: true}
            })
    }, [id])

    useEffect(() => {
        if(seed?.data?.result){
            const sliceLength = `${id}_`.length;
            // Get timestamp by removing id and _ from end of seed string
            setMempool(prev => {
                return {
                    ...prev,
                    timestamp: parseInt(seed.data.result.slice(0, -sliceLength))
                }
            })
        }
    }, [seed.data])

    useEffect(() => {
        if(epoch_length?.data?.result){
            setMempool(prev => {
                return {
                    ...prev,
                    epoch_length: ethers.BigNumber.from(epoch_length.data.result.hex).toNumber()
                }
            })
        }
    }, [epoch_length.data])

    useEffect(() => {
        if(epoch?.data?.result){
            setMempool(prev => {
                return {
                    ...prev,
                    epoch: ethers.BigNumber.from(epoch.data.result.hex).toNumber()
                }
            })
        }
    }, [epoch.data])

    useEffect(() => {
        
        if(
            !mempool.epoch_remaining
            &&
            mempool.timestamp
            &&
            mempool.epoch_length
            &&
            mempool.epoch
        ){
            const next_epoch = mempool.timestamp + (mempool.epoch_length * mempool.epoch);
            const epoch_remaining = Math.round(next_epoch - (Date.now() / 1000));

            setMempool(prev => {
                return {
                    ...prev,
                    epoch_remaining,
                    next_epoch,
                }
            })
        }


        if(
            mempool.loading
            &&
            mempool.timestamp
            &&
            mempool.epoch_length
            &&
            mempool.epoch
        ){
            setMempool(prev => {
                return {
                    ...prev,
                    loading: false
                }
            })
        }

    }, [mempool])


    useEffect(() => {
        console.log(mempool)
    }, [mempool])

    return mempool;

}