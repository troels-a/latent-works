/// Provider for LTNT contract

import React, { createContext, useContext, useEffect, useState } from 'react'
import ABI from '@lw/contracts/abi/LTNT.json'
import { useWeb3React } from '@web3-react/core'
import useContract from 'hooks/useContract';

const LTNTContext = createContext();

export function useLTNT() {
    const context = React.useContext(LTNTContext)
    if (context === undefined) {
        throw new Error('useLTNT must be used within a LTNTProvider')
    }
    return context
}

const createLTNT = (p) => {
    const {account} = useWeb3React();
    const [balance, setBalance] = useState(0);
    const [tokens, setTokens] = useState([]);
    const [picked, pick] = useState(null);
    const [isPicking, setIsPicking] = useState(false);

    const LTNT = useContract({
        address: process.env.NEXT_PUBLIC_LTNT_ADDRESS,
        abi: ABI,
        endpoint: '/api/LTNT'
    })

    useEffect(() => {
        if(account) {
            LTNT.read('balanceOf', {owner: account})
            .then(res => {
                setBalance(res.result);
            })
        }
    }, [account]);

    useEffect(() => {
        if(balance > 0)
            fetch(`/api/LTNT/get?address=${account}`)
            .then(res => res.json())
            .then(res => setTokens(res));
    }, [balance])

    return {balance, tokens, pick, picked, isPicking, setIsPicking}

}

export function LTNTProvider({ children }) {

    const LTNT = createLTNT();
    return <LTNTContext.Provider value={LTNT}>
        {children}
    </LTNTContext.Provider>

}