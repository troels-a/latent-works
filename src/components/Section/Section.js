import styled from "styled-components";
import {breakpoint} from 'styled-components-breakpoint';

const Section = styled.div`

    padding: 2vw;
    ${p => p.$whitespace && 'padding: 10vw 5vw;'}
    ${p => p.$color && `background-color: ${p.$color};`}
    ${p => p.$small && `font-size: 0.8em;`}

    ${breakpoint('sm', 'md')`
        padding: 4vw;
    `}

`

export default Section;