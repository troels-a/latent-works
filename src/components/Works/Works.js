import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components"
import {breakpoint} from 'styled-components-breakpoint';

const Restrain = styled.div`
    ${breakpoint('sm', 'md')`
        max-width: 100%;
        overflow: scroll;
    `}

`

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    > div {
        width: ${100/7}%;
    }

    ${breakpoint('sm', 'md')`
        flex-wrap: no-wrap;
        width: 700vw;
        > div {
            width: 100vw;
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

    return <Restrain><Wrapper>
        {editions.map(edition => <div>
            <img src={`/api/77x7/image/${work}?edition=${edition}`}/>
        </div>)}
    </Wrapper>
    </Restrain>

}