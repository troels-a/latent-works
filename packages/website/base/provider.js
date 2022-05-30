import { ethers } from 'ethers';

export function getProvider(){
    return new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_NETWORK_ENDPOINT);
}
