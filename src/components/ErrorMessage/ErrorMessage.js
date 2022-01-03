import useError from "hooks/useError";
import { useEffect, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
    
position: fixed;
z-index: 100;
top: 0;
left: 0;
right: 0;
height: 2em;
background-color: pink;
padding: 2em;
transition: all 200ms;
    ${p => p.$show ? `
        opacity: 1;
        transform: translateY(0%);
    ` : `
        opacity: 0;
        transform: translateY(-100%);
    `}

`

function ErrorMessage({children, ...p}){
    
    const err = useError();
    function handleClick(e){
        e.preventDefault();
        err.setMessage(false);
    }

    return <Wrapper onClick={handleClick} $show={err.message} {...p}>
        {err.message}
    </Wrapper>
}


export default ErrorMessage;