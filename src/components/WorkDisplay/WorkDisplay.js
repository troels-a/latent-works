import useWork from 'hooks/useWork';
import styled from 'styled-components';
import {breakpoint} from 'styled-components-breakpoint';

const WorkImages = styled.div`
    position: relative;
    height: 50vw;
    width: 50vw;
    background-color: ${p => p.theme.colors.white};
    ${breakpoint('sm', 'md')`
        width: 100vw;
        height: 100vw;
    `}
`

const WorkImage = styled(({src, children, placeholder, show, ...p}) => <img {...p} src={src}/>)`
    cursor: pointer;
    margin: 0;
    padding: 0;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    left: 0;
    opacity: 0;
    transition: opacity ${p => `${p.speedOut}ms ${p.speedIn}ms`};
    
    z-index: 1;
    &:last-child{
        z-index: 0;
    }

    ${p => p.show && `
        transition: opacity ${p.speedIn}ms;
        opacity: 1;
        z-index: 1!important;
    `}

    ${p => p.placeHolder && `
        opacity: 1;
        &:before {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: block;
            content: '';
            background-color: ${p.theme.colors.text};
        }
    `}
`


export default function WorkDisplay({iteration, ...p}){

    const work = useWork();
    const speed = 2500;

    return <WorkImages {...p}>
        {work && [1,2,3,4,5,6,7].map(index => <WorkImage speedIn={iteration == 1 ? 500 : speed} speedOut={iteration == 7 ? 500 : speed} show={iteration == index} key={index} src={work.iterations[index-1]}/>)}
    </WorkImages>

}