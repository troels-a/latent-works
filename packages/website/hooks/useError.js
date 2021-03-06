import React, { useState, useEffect } from 'react';

const ErrorCtx = React.createContext(false);

const createError = p => {

    const [message, setMessage] = useState();
    const [actions, setActions] = useState();

    async function send(msg, timeout = false){
        setMessage(msg)
        if(timeout)
            setTimeout(() => setMessage(''), timeout);
    }

    function render(){
        message;
    }

    function reset(){
        setMessage(null);
        setActions(null)
    }

    return {message, setMessage, actions, setActions, send, reset};
}


export const ErrorProvider = ({children, ...props}) => {
    const _err = createError(props);
    return <ErrorCtx.Provider value={_err}>{children}</ErrorCtx.Provider>
};


export default function useError() {
    const context = React.useContext(ErrorCtx)
    if (context === undefined) {
        throw new Error('useError must be used within a ErrorProvider')
    }
    return context
}