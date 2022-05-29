import styled, { keyframes } from "styled-components";

const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`

function _Loader({children, ...p}){

    return <div {...p}>
        {children}
    </div>

}

export default styled(_Loader)`
    position: absolute;
    text-align: center;
    &:before {
        transform-origin: 50% 50%;
        position: relative;
        top: -30px;
        left: -15px;
        display: block;
        content: '-';
        width: 100%;
        height: 0px;
        animation: ${spin} 500ms infinite;
    }

`