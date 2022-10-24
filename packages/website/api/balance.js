import { ethers } from "ethers";
import { getProvider } from '@lw/website/base/provider';

export default async (req, res) => {

    const data = {};
    const {address, ...query} = req.query;
    const provider = getProvider();
    let balance = await provider.getBalance(address);
    balance = ethers.utils.formatEther(balance);
    
    res.setHeader(`Cache-Control`, `s-maxage=10, stale-while-revalidate`)
    res.status(200).json(balance);

}