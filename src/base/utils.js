import { ethers } from "ethers";

export const chains = {
    1: "mainnet",
    4: "rinkeby",
    31337: "localhost"
}

export function truncate(input, length, append = '...') {
    if(input.length > length)
       return input.substring(0, length)+append;
    return input;
};

export function getProvider(){
    const dev = process.env.NODE_ENV === 'development'    
    const network = process.env.NODE_ENV === 'test' ? 'rinkeby' : 'homestead';
    return new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
}

export function chainToName(id){
    return chains[id];
}