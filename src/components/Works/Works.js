import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components"
import {breakpoint} from 'styled-components-breakpoint';

const Wrapper = styled.div`
    display: flex;
    width: calc(100% + 2vw);
    margin-left: -1vw;
    > div {
        width: ${100/7}%;
        padding: 0 1vw;
    }

    ${breakpoint('sm', 'md')`
        flex-direction: column;
        > div {
            width: 100%;
        }
    `}
        
`

const editions = [1,2,3,4,5,6,7];

export default function Works(props){

    const [work, setWork] = useState(1);

    useEffect(() => {
        const updater = setInterval(() => {
            setWork(Math.floor(Math.random() * 7)+1);
        }, 5000);
        return () => {
            clearInterval(updater);
        }
    }, []);

    return <Wrapper>
        {editions.map(edition => <div>
            <img src={`svg/${work}/${edition}.svg`}/>
        </div>)}
    </Wrapper>

}