import { ethers } from 'ethers';
import abi from '../../../src/base/abi/77x7.json';



export default async (req, res) => {
    
    const {work} = Object.assign({}, req.query);
    
    const address   = "0xef7c89f051ac48885b240eb53934b04fcf3339ab";
    const provider  = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_ID);
    const contract  = new ethers.Contract(address, abi, provider);
    const data      = await contract.getWork(parseInt(work));
    const resp      = {};

    resp.id = data[0].toNumber();
    resp.name = data[1];
    resp.description = data[2];
    resp.image = data[3];
    resp.iterations = data[4];
    resp.colors = data[5];

    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate")
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resp, null, 2));

}