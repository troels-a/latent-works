import React, { useState, useEffect } from 'react';
import abi from '@abi/LW00x0.sol/LW00x0.json';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { keys, mapKeys } from 'lodash';

const _00x0Context = React.createContext(false);

const create00x0 = (p) => {
    
    const [contract, setContract] = useState();
    const {library, account} = useWeb3React();

    function api(method, args){
        let query = method;
        if(args){

            const keyValues = [];
            for(const key in args){
                if (Object.hasOwnProperty.call(args, key)) {
                    keyValues.push(key+'='+args[key]);
                }
            }
            query += '?'+keyValues.join('&');

        }
        return fetch(`/api/00x0/${query}`).then(data => data.json()).catch(e => console.log(e))
    }

    useEffect(() => {
        if(account && library){
            const _contract = new ethers.Contract(process.env.NEXT_PUBLIC_ADDRESS_00X0, abi, library.getSigner());
            setContract(_contract);
        }

    }, [account, library])

    useEffect(() => {
        return () => {
            setContract(false);
        }
    }, [])
        
    return {
        contract, api
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