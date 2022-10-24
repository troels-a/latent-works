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

const LTNTImg = styled.img`
    aspect-ratio: 60/100;
    width: 150px;
    height: auto;
    margin: 0 auto;
`;

const Token = styled.div`

    padding: 0 2px;
    text-align: center;
    display: flex;
    flex-direction: row;
    align-items: center;

    ${LTNTImg} {

        cursor: pointer;
        transform: scale(0.95);
        opacity: 0.8;
        transition: all 0.1s ease-in-out;
        border: 0px solid ${p => p.theme.colors.primary};
        box-sizing: border-box;
        border-radius: 10px;

        ${p => p.picked && `
        
            transform: scale(1);
            opacity: 1;
            border-width: 2px;

        `}

    }

`

export default function Picker({...p}){

    const {balance, tokens, pick, picked, isPicking, setIsPicking} = useLTNT();
    
    return <Modal show={isPicking} {...p}>
        <ModalInner>
            <Grid as={Container} style={{width: 'auto'}}>
                <Grid.Unit size={1/1}>
                    <h2>LTNT inventory</h2>
                    <p>These are your LTNT tokens. Select one to use it througout the site whereever applicable. Your selection will always be highlighted in the menubar.</p>
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