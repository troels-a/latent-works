import styled from 'styled-components'
import Head from 'next/head';
import Link from 'next/link'
import { TITLE, DESCRIPTION } from 'base/constants';
import Grid from 'styled-components-grid';
import ConnectButton from 'components/ConnectButton';
import {breakpoint} from 'styled-components-breakpoint';

const Wrapper = styled.div`

  min-height: 100vh;
  width: 100%;
  padding: 2vw 2vw 15vw 2vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  ${breakpoint('lg')`
    width: 70vw;
    text-align: left;
    margin: 0 auto;
  `}

`

const Header = styled(Grid)`
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1; */
  padding: 2vw 0;
  height: auto;
  place-items: center;
`

const Content = styled.main`

  margin-bottom: 3vw;

`

const Title = styled.h1`
  margin: 0;
  position: relative;
  left: -3px;
  a {
    text-decoration: none;
  }
`

const Footer = styled.footer`
  display: flex;
  > * {
    margin-right: 2vw;
  }

`



export default function Viewer({children, ...props}){

    return <>

      <Head>
        <title>{TITLE}{props.title && ` >> ${props.title}`}</title> 
        <meta name="description" content={props.description ? props.description : DESCRIPTION}/>
      </Head>
        <Wrapper>

          <Header>
            
            <Grid.Unit component={Title} size={{sm: 1/2, md: 1/3}}>
              <Link href="/">
                <a>
                Latent Works
                </a>
              </Link>
            </Grid.Unit>

          </Header>
          
          <Content>
          {children}
          </Content>

          <Footer>

            <Link href="https://t.co/qRrVVkm0Rh">
              <a>
                  Discord
              </a>
            </Link>

            <Link href="https://twitter.com/latent_works">
                <a>
                  Twitter
                </a>
            </Link>

          </Footer>
        </Wrapper>
    </>

}