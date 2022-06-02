import _00x0ABI from '@lw/contracts/abi/LW00x0.json';
import { ethers } from "ethers";
import ABIAPI from 'abiapi';
import { getProvider } from '@lw/website/base/provider';
import { bigNumbersToNumber } from 'abiapi/parsers';

const abi = new ABIAPI(_00x0ABI);
abi.supportedMethods = abi.getReadMethods();
abi.cacheTTL = 3;

function compToCompObject(comp){

    return {
        id: comp.id.toNumber(),
        creator: comp.creator,
        seed: comp.seed,
        image: comp.image,
        editions: comp.editions.toNumber(),
        available: comp.available.toNumber()
    }

}

/// PARSERS
abi.addParser('getCompCount', bigNumbersToNumber);
abi.addParser('getComps', result => result.filter(comp => comp.id > 0));
abi.addParser('getComps', (result) => result.map(comp => (compToCompObject(comp))))
abi.addParser('getComp', (result) => compToCompObject(result))

/// TTLs
// abi.setMethodCacheTTL('getCompCount', 3);
// abi.setMethodCacheTTL('getComps', 3);
// abi.setMethodCacheTTL('getComp', 3);

export default async (req, res) => {

    const data = {};
    const {method, ...query} = req.query;

    if(abi.supportsMethod(method)){

        const provider = getProvider();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_00X0, _00x0ABI, provider);
        
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