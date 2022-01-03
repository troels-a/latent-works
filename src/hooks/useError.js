import React, { useState, useEffect } from 'react';

const ErrorCtx = React.createContext(false);

const createError = ({workID, ...p}) => {
    const [message, setMessage] = useState();
    return {message, setMessage};
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