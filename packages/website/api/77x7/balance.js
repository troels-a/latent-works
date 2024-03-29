import { ethers } from 'ethers';
import { getProvider } from '@lw/website/base/provider';
import abi from '@lw/contracts/abi/LW77x7.json';

export default async (req, res) => {
    
    const {work} = Object.assign({}, req.query);
    
    const _addresses = [];
    const _ids = [];
    const balance = {};
    const provider = getProvider();
    const contract  = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_77X7, abi, provider);
    
    let i = 1;
    while(i <= 77){
        _addresses.push(req.query.address);
        _ids.push(i)
        i++;
    }

    const data = await contract.balanceOfBatch(_addresses, _ids);
    let bal;
    for (let i = 0; i < data.length; i++) {
        bal = data[i].toNumber();
        if(bal)
            balance[i+1] = bal;
    }

    
    res.setHeader("Cache-Control", "s-maxage=3, stale-while-revalidate")
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(balance, null, 2));

}