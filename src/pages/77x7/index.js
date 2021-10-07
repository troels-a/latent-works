import { useWeb3React } from '@web3-react/core';
import { getEntryBySlug } from 'base/contentAPI';
import { useEffect } from 'react';
import styled from 'styled-components';
import Page from 'templates/Page';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useState } from 'react';
import {only, up} from 'styled-breakpoints';
import { useBreakpoint } from 'styled-breakpoints/react-styled';

const Section = styled.div`
margin-bottom: 2vw;
`

const WorkWrap = styled(({children, ...p}) => <div {...p}><div>{children}</div></div>)`
    
    width: 100vw;

    ${only('sm')}{
        transform: translateX(-3.5vw);
    }

    ${only('md')}{
        transform: translateX(-2.9vw);
    }
    
    ${up('lg')}{
        transform: translateX(-17vw);
    }

    .swiper-slide {
        display: flex;
    }

`

const WorkImage = styled(({src, children, ...p}) => <img src={src}/>)`
    margin: 0;
    padding: 0;
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

    const [perView, setPerView] = useState(4);
    const sm = useBreakpoint(only('sm'));
    const md = useBreakpoint(only('md'));

    useEffect(() => {
        if(sm)
            setPerView(1)
        else if(md)
            setPerView(2)
        else
            setPerView(4)
    }, [md]);

    return <Page>
        <Section dangerouslySetInnerHTML={{__html: props.content}}/>
        {props.works && props.works.map(work => <WorkWrap work={work}>
            <Swiper
                  spaceBetween={0}
                  slidesPerView={perView}
            >
            {[1,2,3,4,5,6,7].map(iteration => <SwiperSlide>
                <WorkImage src={`${work.image}&edition=${iteration}`}>
                {/* <Tools><a>Render PNG</a> | <a>Download SVG</a></Tools> */}
                {/* <Meta>
                    Minted by: 0x3827...Be79
                </Meta> */}
                </WorkImage>
            </SwiperSlide>)}
            </Swiper>
        </WorkWrap>)}

    </Page>

}

export async function getStaticProps(){
    
    const content = await getEntryBySlug('pages', '77x7');
    const works = [];
    let i = 1;
    while(i <= 77){

        works.push({
            id: i,
            title: 'Latent Work #'+i,
            image: `/api/77x7/image/${i}?format=svg`,
            image_large: `/api/77x7/image/${i}?format=svg&size=large`
        })

        i++;
    }

    return {
        props: {
            works: works,
            ...content
        }
    }
}