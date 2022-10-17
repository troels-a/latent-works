import Modal, { ModalActions, ModalInner } from "components/Modal";
import { useState, useEffect } from "react";
import Grid from "styled-components-grid";
import { useLTNT } from "./Provider";
import styled from "styled-components";

const Container = styled.div`
    align-items: center;
    justify-content: center;
`

const Token = styled.div`
    width: 12vw;
    padding: 0 2px;
    transform: scale(0.95);
    opacity: 0.8;
    ${p => p.picked && `
        transform: scale(1);
        opacity: 1;
    `}
`

const LTNTImg = styled.img`
    width: 100%;
    height: auto;
`;

export default function Picker({...p}){

    const {balance, tokens, pick, picked, isPicking, setIsPicking} = useLTNT();
    
    return <Modal show={isPicking} {...p}>
        <ModalInner>
            <Grid as={Container} style={{width: 'auto'}}>
        {tokens && tokens.map((token, i) => {
            return <Grid.Unit as={Token} picked={picked === token.id} size={1/tokens.length} key={i} onClick={() => {
                if(picked === token.id)
                    pick(null)
                else
                    pick(token.id);

            }}>
                <LTNTImg src={token.image} />
            </Grid.Unit>
        })}
        </Grid>
        <ModalActions
            actions={[
                {label: 'OK', callback: () => setIsPicking(false)}
            ]}
        />
 
        </ModalInner>

    </Modal>
    
}