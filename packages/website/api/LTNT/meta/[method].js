import parentABI from '@lw/contracts/abi/LTNT.json';
import ABI from '@lw/contracts/abi/LTNT_Meta.json';
import { ethers } from "ethers";
import ABIAPI from 'abiapi';
import { getProvider } from '@lw/website/base/provider';

const abi = new ABIAPI(ABI);
abi.supportedMethods = abi.getReadMethods();
abi.cacheTTL = 3;

// function compToCompObject(comp){
//     console.log(comp)
//     return {
//         id: comp.id.toNumber(),
//         creator: comp.creator,
//         seed: comp.seed.toNumber(),
//         artwork: comp.artwork,
//         price: comp.price.toString(),
//         editions: comp.editions.toNumber(),
//         available: comp.available.toNumber()
//     }

// }

// abi.addParser('getComps', (result) => result.map(comp => (compToCompObject(comp))))

export default async (req, res) => {

    const data = {};
    const {method, ...query} = req.query;

    if(abi.supportsMethod(method)){

        const provider = getProvider();
        const _ltnt = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_LTNT, parentABI, provider);
        const contract = new ethers.Contract(await _ltnt.getMetaContract(), ABI, provider);
        
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