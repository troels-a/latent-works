import { ethers } from 'ethers';
import { getProvider } from '../../../shared/provider';
import abi from '../../../sol/abi/sol/contracts/LatentWorks.sol/LatentWorks_77x7.json';
export default async (req, res) => {
    
    const {work} = Object.assign({}, req.query);
    
    const address = process.env.NEXT_PUBLIC_ADDRESS_77X7;
    const provider = getProvider();
    const contract  = new ethers.Contract(address, abi, provider);
    const data      = await contract.getWork(parseInt(work));
    const minters   = [];
    let i = 1;
    while(i <= 7){
        minters.push(await contract.getMinter(parseInt(work), i));
        i++;
    }

    const resp      = {};

    resp.id = data[0].toNumber();
    resp.name = data[1];
    resp.description = data[2];
    resp.image = data[3];
    resp.iterations = data[4];
    resp.colors = data[5];
    resp.minters = minters;

    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate")
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resp, null, 2));

}