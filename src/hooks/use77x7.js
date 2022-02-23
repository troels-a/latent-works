import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect } from 'react';

const _77x7Context = React.createContext(false);

const create77x7 = (p) => {
    
    const {active, account} = useWeb3React();

    const [balance, setBalance] = useState(false);
    const [fetchingBalance, setFetchingBalance] = useState(false);

    const fetchBalance = async (address) => {
        try {
            setFetchingBalance(true);
            const response = await fetch(`/api/77x7/balance?address=${address}`);
            const json = await response.json();
            setFetchingBalance(false);
            setBalance(json);
        }
        catch(e){
            console.log(e)
            setFetchingBalance(false);
        }   
    }

    useEffect(() => {

        if(account){
            fetchBalance(account);
        }

        return () => {
            setFetchingBalance(false);
            setBalance(false);
        }
        
    }, [account])

    
    
    return {
        balance: balance,
        fetchingBalance: fetchingBalance
    };
    
}


export const _77x7Provider = ({children, ...props}) => {
    const _77x7 = create77x7(props);
    return <_77x7Context.Provider value={_77x7}>{children}</_77x7Context.Provider>
};


export default function use77x7() {
    const context = React.useContext(_77x7Context)
    if (context === undefined) {
        throw new Error('use77x7 must be used within a _77x7Provider')
    }
    return context
}