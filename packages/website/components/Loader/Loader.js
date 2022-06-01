import useInterval from "hooks/useInterval";
import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

const Dots = styled.span`
display: inline-block;
    width: 2em;
`

export default function Loader({children, ...p}){

    const [dots, setDots] = useState('');
    
    useInterval(() => {
        if(dots.length < 3)
            setDots(dots+'.');
        else
            setDots('');
    }, 500);

    return <div {...p}>
        {children}<Dots>{dots}</Dots>
    </div>

}