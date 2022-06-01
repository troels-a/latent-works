import _00x0_meta_ABI from '@lw/contracts/abi/LTNT_Meta.json';
import Page from "templates/Page"
import Grid from "styled-components-grid"
import Section from "components/Section/Section";
import use77x7, {_77x7Provider} from "hooks/use77x7";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { map } from "lodash";
import useWork, { WorkProvider } from "hooks/useWork";
import styled, { css, keyframes } from "styled-components";
import use00x0, { _00x0Provider } from "hooks/use00x0";
import { AspectRatio } from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import { getEntryBySlug } from "base/contentAPI";
import { useConnectIntent } from "components/ConnectButton";
import useError from "hooks/useError";
import useContract from "hooks/useContract";
import {breakpoint} from "styled-components-breakpoint";
import Loader from 'components/Loader';
import AbortController from "abort-controller";
import Modal, {ModalActions, ModalInner} from 'components/Modal';

const Works = styled(p => <Grid container {...p}/>)`
    width: calc(100%+1vw);
    margin-left: -0.5vw;
`;

const colorPulse = keyframes`
    0% {
        background-color: rgba(255,255,255,0.05);
    }
    50% {
        background-color: rgba(255,255,255,0.1);
    }
    100% {
        background-color: rgba(255,255,255,0.05);
    }
`

const Work = styled(({children, ...p}) => <Grid.Unit {...p} size={1/3}><AspectRatio style={{width: '100%'}} ratio="1/1">{children}</AspectRatio></Grid.Unit>)`

    padding: 0 .5vw 1vw .5vw;
    position: relative;

    ${p => p.index > 0 && `

    &:before {
        content: "${p.index}";
        color: black;
        display: inline-block;
        position: absolute;
        top: 0;
        padding: 1px 2px;
        background-color: white;
        z-index: 2;
    }

    `}

    > * {
        ${p => !p.loaded && css`animation: ${colorPulse} 2s infinite;`}
    }

`


const MintingSection = styled(Section)`
    
    ${p => p.disabled && `
        opacity: 0.2;
        pointer-events: none;
    `}
`

const Center = styled.div`
    text-align: center;
`

const Button = styled.button`
    
    ${breakpoint('sm', 'md')`
        width: 100%;
    `}

    ${p => p.fullWidth && 'width: 100%;'}
    ${p => p.invertColors && `
        background-color: ${p.theme.colors.text}!important;
        color: ${p.theme.colors.bg}!important;
    `}

`


const Preview = styled.img`
    max-height: ${p => p.maxHeight ? p.maxHeight : 70}%; 
`

function SelectableWork(p){

    const work = useWork();
    const [loaded, setLoaded] = useState(false);
    
    return <Work {...p} loaded={loaded}>
        {work && <img onLoad={() => setLoaded(true)} style={{height: 'auto', maxWidth: '100%'}} key={work.id} src={work.iterations[6]}/>}
    </Work>

}

let previewController;

function _00x0_Transfer(props){

    const {account} = useWeb3React();
    const {balance, fetchBalance, fetchingBalance} = use77x7();
    const _77x7 = use77x7();
    const _00x0 = use00x0();
    const _00x0_Meta = useContract({endpoint: '/api/00x0/meta', abi: _00x0_meta_ABI});
    
    const [selectedWorks, setSelectedWorks] = useState([]);
    const {connectIntent, setConnectIntent} = useConnectIntent();

    const [transferPrompt, setTransferPrompt] = useState(false);
    const [transferPreview, setTransferPreview] = useState(false);
    const [transferring, setTransferring] = useState(false);

    const [preview, setPreview] = useState(false);

    const err = useError();

    useEffect(() => {

        if(_00x0.contract){
            updateMetaContract();
        }

    }, [_00x0.contract])

    async function updateMetaContract(){
        const meta_address = await _00x0.contract._00x0_meta()
        await _00x0_Meta.setAddress(meta_address);
    }


    async function openTransferPrompt(){

        setTransferPrompt(true);

        try {

            previewController = new AbortController()            
            const response = await _00x0_Meta.read('previewImage', {
                salt_: account,
                works_: selectedWorks
            }, previewController)

            setTransferPreview(response.result);

        }
        catch(err){
            console.log(err)
            setTransferPrompt(false)
        }

    }


    async function handleTransfer(){
        
        setTransferring(true);
        const works = selectedWorks.map(id => parseInt(id));
        const values = Array(works.length).fill(1);
        const from = account;
        const to = _00x0.contract.address;
        
        try {
            
            const tx =  works.length < 2 
            ? await _77x7.contract.safeTransferFrom(from, to, works[0], values[0], [])
            : await _77x7.contract.safeBatchTransferFrom(from, to, works, values, []);

            await tx.wait();

            setTransferring(false);
            fetchBalance(account);
            setSelectedWorks(prev => [])

        }
        catch(e){

            err.setMessage(e.message)
            setTransferring(false);

        }

        resetTransferPrompt();
        
    }


    async function handlePreview(){
        
        setPreview(-1)

        try {
            previewController = new AbortController()            
            const response = await _00x0_Meta.read('previewImage', {
                salt_: account,
                works_: selectedWorks
            }, previewController)

            setPreview(response.result);

        }
        catch(err){
            console.log(err)
            setPreview(false);
        }

    }

    
    // Cancel any preview request
    async function cancelPreview(){
        previewController.abort();
    }


    async function resetTransferPrompt(){
        setTransferPrompt(false);
        setTransferPreview(false);
    }


    return <Page>
        <Grid>
            {!account && <h2 style={{textAlign: 'center', width: '100%', paddingTop: '2vw'}}>Connect to create</h2>}
            {account && <>
            <Grid.Unit size={{sm: 1/1, md: 6/12}}>
                <MintingSection disabled={transferring} padTop={0}>                    
                    {(fetchingBalance) && <div>Looking for 77x7 works...</div>}
                    {(account && !fetchingBalance && !balance) && <div>No 77x7 works found</div>}
                    {(balance && !fetchingBalance) && <Works>
                        {map(balance, (_bal, _id) => {
                        
                        return <WorkProvider workID={_id}>
                            <SelectableWork selected={selectedWorks.includes(_id)} index={selectedWorks.indexOf(_id)+1} onClick={() => setSelectedWorks(prev => {

                                const index = prev.indexOf(_id);
                                if(index > -1){
                                    delete prev[index];
                                }
                                else{
                                    if(prev.length == 7){
                                        prev.shift();
                                    }
                                    prev.push(_id);
                                }

                                return prev.filter(val => val);
                                    
                            })}/>
                        </WorkProvider>

                        })}
                    </Works>
                    }
                </MintingSection>
            </Grid.Unit>
            <Grid.Unit size={{sm: 1/1, md: 6/12}}>
                <Section $padBottom={0} dangerouslySetInnerHTML={{__html: props.page00x0.content}}/>
                <Section $padTop={0}>
                    <small>
                <a href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_ADDRESS_00X0}`}>
                    Contract
                </a>
                ·
                <a href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_ADDRESS_00X0}`}>
                    Discord
                </a>
                </small>
                </Section>

                <Section>
                {}
                {account && 
                    <>
                        {/* <table style={{width: '50%'}}>
                        <thead>
                            <td>Work</td><td>Balance</td>
                        </thead>
                        {Object.keys(balance).map(key => <tr><td>#{key.length < 2 ? `0${key}` : key}</td> <td>{balance[key]}</td></tr>)}
                        </table> */}
                    
                        <Button disabled={!(selectedWorks.length > 1 && selectedWorks.length < 8)} onClick={() => openTransferPrompt()}>
                            Transfer
                        </Button>
                        <Button disabled={!(selectedWorks.length > 1 && selectedWorks.length < 8)} onClick={() => handlePreview()}>
                            Preview
                        </Button>
                    </>
                }
                </Section>
            </Grid.Unit>
            </>}
        </Grid>



        {/* PREVIEW MODAL */}
        <Modal show={preview !== false && preview !== -100}>
            
            {preview !== -1 && <Preview src={preview}/>}

            <ModalInner>
                
                {preview === -1 && <>
                    <Loader>Generating preview</Loader>
                    <ModalActions actions={[{label: 'Cancel', callback: cancelPreview}]}/>
                </>}

                {preview !== -1 && <ModalActions actions={[{label: 'Close', callback: () => setPreview(false)}]}/>}
            </ModalInner>

        </Modal>



        {/* TRANSFER PREVIEW MODAL */}
        <Modal show={transferPrompt}>

                {transferPreview && <Preview maxHeight={50} src={transferPreview}/>}
                <ModalInner>
                    
                    {transferPreview === false && <>
                        <Loader>Generating transaction</Loader>
                        <ModalActions actions={[{label: 'Cancel', callback: cancelPreview}]}/>
                    </>}


                    {transferPreview !== false && <>
                    <small>
                        You are about to permanently transfer <strong>{selectedWorks.length}</strong> 77x7 works out of your wallet.
                        The transfer will result in the above 00x0 being created and the first edition being minted directly to your wallet. The remaining {selectedWorks.length-1 > 1 ? `${selectedWorks.length-1} editions` : `edition`} will be publicly mintable for 0.07 ETH{selectedWorks.length-1 > 1 && ` each`} of which you will receive 50%.
                        Additionally {selectedWorks.length} LTNT passports will be issued to your wallet.
                    </small>
                    <br/>
                    <br/>
                    {transferring && <Loader>Transferring</Loader>}
                    {!transferring && <ModalActions actions={[
                        {label: 'Cancel', callback: resetTransferPrompt},
                        {label: 'Transfer', cta: true, callback: handleTransfer}
                    ]}/>}
                    </>
                    }

                </ModalInner>
            
        </Modal>
    </Page>

}

function ZeroZeroByZeroTransfer(p){
    return <_77x7Provider><_00x0Provider><_00x0_Transfer {...p}/></_00x0Provider></_77x7Provider>;
}


export async function getStaticProps(){
    
    const page00x0 = await getEntryBySlug('pages', '00x0');

    return {
        props: {
            page00x0: page00x0,
        }
    }
}

export default ZeroZeroByZeroTransfer;