import { ethers } from 'ethers';
import { getProvider } from '@lw/website/base/provider';
import abi from '@lw/contracts/abi/LTNT.json';

export default async (req, res) => {
    
    const {work, address} = Object.assign({}, req.query);
    
    const ids = [];
    const provider = getProvider();
    const contract  = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_LTNT, abi, provider);
    
    let i = 1;
    const max = 9999;
    while(i <= max){
        try {
            const owner = await contract.ownerOf(i);
            console.log('checked', i);
            if(owner === address){
                ids.push(i);
            }
            i++;    
        }
        catch(e){
            i = max+1;
        }
    }


    const tokens = await Promise.all(ids.map(async id => {
        const token = await contract.tokenURI(id)
        .then(res => res.replace('data:application/json;base64,', ''))
        .then(res => Buffer.from(res, 'base64').toString('utf-8'))
        .then(res => JSON.parse(res));
        token.id = id;
        return token;
    }))

    
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate")
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(tokens, null, 2));

}