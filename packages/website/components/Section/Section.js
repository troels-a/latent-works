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
    ${p => p.$padtop && `padding-top: ${p.$padtop ? p.$padtop*1 : 5}vw;`}
    ${p => p.$padbottom && `padding-bottom: ${p.$padbottom ? p.$padbottom*1 : 5}vw;`}

    ${breakpoint('sm', 'md')`
        padding: 4vw;
    `}

`

export default Section;