import styled from "styled-components";
import {breakpoint} from 'styled-components-breakpoint';

const Section = styled.div`

    padding: 2vw;
    ${p => p.$whitespace && 'padding: 10vw 5vw;'}
    ${p => p.$color && `background-color: ${p.$color};`}
    ${p => p.$small && `font-size: 0.8em;`}
    ${p => p.$large && `font-size: 1.3em;`}
    ${p => p.$compact && `max-width: 70%;`}
    ${p => p.$center && `margin-left: auto; margin-right: auto;`}
    ${p => p.$padTop > -1 && `padding-top: ${p.$padTop > -1 ? p.$padTop : 5}vw;`}
    ${p => p.$padBottom > -1 && `padding-bottom: ${p.$padBottom > -1 ? p.$padBottom : 5}vw;`}
    ${p => p.$padLeft > -1 && `padding-left: ${p.$padLeft > -1 ? p.$padLeft : 5}vw;`}
    ${p => p.$padRight > -1 && `padding-right: ${p.$padRight > -1 ? p.$padRight : 5}vw;`}
    ${p => p.$marginTop > -1 && `margin-top: ${p.$marginTop > -1 ? p.$marginTop : 0}vw;`}
    ${p => p.$marginBottom > -1 && `margin-bottom: ${p.$marginBottom > -1 ? p.$marginBottom : 0}vw;`}
    ${p => p.$marginLeft > -1 && `margin-left: ${p.$marginLeft > -1 ? p.$marginLeft : 0}vw;`}
    ${p => p.$marginRight > -1 && `margin-right: ${p.$marginRight > -1 ? p.$marginRight : 0}vw;`}

    ${breakpoint('sm', 'md')`
        padding: 4vw;
    `}

`

export default Section;