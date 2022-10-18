import Modal, { ModalActions, ModalInner } from "components/Modal";
import { useState, useEffect } from "react";
import Grid from "styled-components-grid";
import { useLTNT } from "./Provider";
import styled from "styled-components";

const Container = styled.div`
    align-items: center;
    justify-content: center;
    > div {
        text-align: left;
    }
`

const Token = styled.div`
    width: 12vw;
    padding: 0 2px;
    transform: scale(0.95);
    opacity: 0.8;
    transition: all 0.1s ease-in-out;
    cursor: pointer;
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
                <Grid.Unit size={1/1}>
                    <h2>LTNT inventory</h2>
                    <p>These are your LTNT tokens. Click to select a token to use wherer revelant throughout the site. When a LTNT is selected you'll see an asterisk next to your balance.</p>
                </Grid.Unit>
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
                {label: picked ? `Continue with LTNT #${picked}` : `Close`, callback: () => setIsPicking(false)}
            ]}
        />
 
        </ModalInner>

    </Modal>
    
}