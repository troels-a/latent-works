import _BE_ABI from '@lw/contracts/abi/LWBrokenEnglish.json';
import { ethers } from "ethers";
import ABIAPI from 'abiapi';
import { getProvider } from '@lw/website/base/provider';
import { bigNumbersToNumber } from 'abiapi/parsers';

const abi = new ABIAPI(_BE_ABI);
abi.supportedMethods = abi.getReadMethods();
abi.cacheTTL = 3;

/// PARSERS
abi.addParser('getLineCount', bigNumbersToNumber);

export default async (req, res) => {

    const data = {};
    const {method, ...query} = req.query;

    if(abi.supportsMethod(method)){

        const provider = getProvider();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_BE, _BE_ABI, provider);
        
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
        res.setHeader(`Cache-Control`, `s-maxage=${abi.getMethodCacheTTL(method)}, stale-while-revalidate`)

    res.status(status).json(data);


}