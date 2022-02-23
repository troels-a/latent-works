import React, { useState, useEffect } from 'react';
import abi from '@abi/00x0/LatentWorks_00x0.sol/LatentWorks_00x0.json';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';

const _00x0Context = React.createContext(false);

const create00x0 = (p) => {
    
    const [contract, setContract] = useState();
    const {provider, active} = useWeb3React();

    useEffect(() => {
        if(active && provider){
            setContract(new ethers.Contract('0xa7c59f010700930003b33ab25a7a0679c860f29c', abi, provider));
        }
    }, [active])
        
    return {
        contract
    };
    
}


export const _00x0Provider = ({children, ...props}) => {
    const _00x0 = create00x0(props);
    return <_00x0Context.Provider value={_00x0}>{children}</_00x0Context.Provider>
};


export default function use00x0() {
    const context = React.useContext(_00x0Context)
    if (context === undefined) {
        throw new Error('use00x0 must be used within a _00x0Provider')
    }
    return context
}