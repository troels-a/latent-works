import _MEMPOOLS_ABI from '@lw/contracts/abi/LWMempools.json';
import { ethers } from "ethers";
import ABIAPI from 'abiapi';
import { getProvider } from '@lw/website/base/provider';
import { bigNumbersToNumber } from 'abiapi/parsers';
import { Protocol } from 'puppeteer-core';

function parseBank(bank){
    return {
        name: bank[0],
        parts: bank[1],
        filter: bank[2],
        pools: bank[3].map(pool => pool.toNumber())
    }
}

const abi = new ABIAPI(_MEMPOOLS_ABI);
abi.supportedMethods = abi.getReadMethods();
abi.cacheTTL = 5;

// abi.setMethodCacheTTL('getBankPools', 3);
// abi.setMethodCacheTTL('getBank', 3);
// abi.setMethodCacheTTL('getBanks', 3);

abi.addParser('getBankPools', bigNumbersToNumber);
abi.addParser('getBank', parseBank);
abi.addParser('getBanks', (banks) => {
    return banks.map(parseBank);
});

export default async (req, res) => {

    const data = {};
    const {method, ...query} = req.query;

    // If the bank image is requested check if the bank is in the fully_minted array and set the cache to 1 day
    const fully_minted = [0,1,2,3,4,5,6];
    if(method == 'getPoolImage' && query.pool_id_){

        const mempools = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS, _MEMPOOLS_ABI, getProvider());
        let bank_index = await mempools.getPoolBankIndex(query.pool_id_);
        bank_index = bank_index.toNumber();

        if(fully_minted.includes(parseInt(bank_index))){
            abi.setMethodCacheTTL('getPoolImage', 60*60*24);
        }

    }

    if(abi.supportsMethod(method)){

        const provider = getProvider();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS, _MEMPOOLS_ABI, provider);
        
        try {
            data.result = await contract[method](...abi.methodParamsFromQuery(method, query));
            data.result = abi.parse(method, data.result);
        }
        catch(e){
            data.error = e.toString();
        }

    }
    else{
        data.error = 'Unsupported method';
    }

    const status = data.error ? 400 : 200;
    
    if(status == 200)
        res.setHeader(`Cache-Control`, `s-maxage=${abi.cacheTTL}, stale-while-revalidate`)

    res.status(status).json(data);


}