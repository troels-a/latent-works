import React, { useState, useEffect } from 'react';

const WorkContext = React.createContext(false);

const createWork = ({workID, ...p}) => {
    
    const [work, setWork] = useState(false);
    
    useEffect(() => {

        if(workID){
            
            async function fetchWork(){
                try{
                    const response = await fetch(`/api/77x7/info/${workID}`);
                    const json = await response.json();
                    setWork(json); 
                }
                catch(e){
                    console.log(e)
                }   
            }
            
            fetchWork();
            
        }
        
    }, [workID])
    
    
    return work;
    
}


export const WorkProvider = ({children, ...props}) => {
    const work = createWork(props);
    return <WorkContext.Provider value={work}>{children}</WorkContext.Provider>
};


export default function useWork() {
    const context = React.useContext(WorkContext)
    if (context === undefined) {
        throw new Error('useWork must be used within a WorkProvider')
    }
    return context
}