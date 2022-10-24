import parentABI from '@lw/contracts/abi/LWMempools.json';
import ABI from '@lw/contracts/abi/LWMempools_Meta.json';
import { ethers } from "ethers";
import ABIAPI from 'abiapi';
import { getProvider } from '@lw/website/base/provider';

const abi = new ABIAPI(ABI);
abi.supportedMethods = abi.getReadMethods();
abi.cacheTTL = 3;

export default async (req, res) => {

    const data = {};
    const {method, ...query} = req.query;

    if(abi.supportsMethod(method)){

        const provider = getProvider();
        const _mempools = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_MEMPOOLS, parentABI, provider);
        const contract = new ethers.Contract(await _mempools._meta(), ABI, provider);
        
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