import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled from 'styled-components';
import Page from 'templates/Page';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useState } from 'react';

const WorkWrap = styled(({children, ...p}) => <div {...p}><div>{children}</div></div>)`
    height: 35vw;
    > div {
        position: absolute;
        left: 0;
        right: 0;
        margin-left: -36vw;
        overflow: scroll;
    }

`

const WorkImage = styled(({src, children, ...p}) => <div {...p}><img src={src}/>{children}</div>)`
    margin: 0 auto;
    padding: 2vw;
    ${p => p.fullScreen && `
        // Do full screen here
    `}
`

const Tools = styled.small`
    display: block;
`
const Meta = styled.small`
    display: block;
`

export default function SeventySevenBySeven(props){

    const [fullScreen, setFullScreen] = useState(false);
    const { activate, active, account, library, chainId} = useWeb3React();

    return <Page>
        
        {props.work && <WorkWrap>
            <Swiper
                  spaceBetween={0}
                  slidesPerView={4}
                  slideToClickedSlide={true}
                  centeredSlides={true}
            >
            {[1,2,3,4,5,6,7].map(iteration => <SwiperSlide>
                <WorkImage fullScreen={(fullScreen == iteration)} src={`${props.work.image}&edition=${iteration}`}>
                <Tools><a>Render PNG</a> | <a>Download SVG</a></Tools>
                <Meta>
                    Minted by: 0x3827...Be79
                </Meta>
                </WorkImage>
            </SwiperSlide>)}
            </Swiper>
        </WorkWrap>}

    </Page>

}

export async function getStaticProps({params, ...context}){

    const work = {
        title: 'Latent Work #'+params.work,
        image: `/api/77x7/image/${params.work}?format=svg`,
        image_large: `/api/77x7/image/${params.work}?format=svg&size=large`
    }

    return {
        props: {
            work: work
        }
    }
}

export async function getStaticPaths(){

    const paths = [];
    let i = 1;
    while(i <= 77){
        paths.push({params: {work: i+''}});
        i++;
    }

    return {
        paths: paths,
        fallback: true,
    };

}