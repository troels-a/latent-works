import useError from "hooks/useError";
import { useEffect, useState } from "react";
import styled from "styled-components";
import Modal, { ModalInner, ModalActions, Prompt} from "components/Modal";
import Button from 'components/Button';

// const Wrapper = styled.div`
    
// position: fixed;
// z-index: 100;
// top: 0;
// left: 0;
// right: 0;
// height: 100vh;
// font-size: 3em;
// background-color: rgba(255,255,255,0.5);
// backdrop-filter: blur(20px);
// display: flex;
// place-items: center;
// justify-content: center;
// transition: all 200ms;
// > div {
//     padding: 2vw;
// }
//     ${p => p.$show ? `
//         opacity: 1;
//         pointer-events: initial;
//         //transform: translateY(0%);
//     ` : `
//         opacity: 0;
//         pointer-events:none;
//         //transform: translateY(-100%);
//     `}
// `


function ErrorMessage({children, ...p}){
    
    const err = useError();

    return <Prompt show={err.message} actions={err.actions ? err.actions : [{label: 'Close', callback: err.reset}]} {...p}>
        {err.message}
    </Prompt>
}


export default ErrorMessage;