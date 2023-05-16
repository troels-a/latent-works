const Filters = () => {
    return <svg style={{display: 'none'}}>
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>
        <filter id="none"><feColorMatrix in="SourceGraphic" type="saturate" values="1"/></filter>
        <filter id="bw"><feColorMatrix type="matrix" values="0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter>
        <filter id="s1"><feColorMatrix in="SourceGraphic" type="saturate" values="2"/></filter>
        <filter id="s2"><feColorMatrix in="SourceGraphic" type="saturate" values="4"/></filter>
        <filter id="s3"><feColorMatrix in="SourceGraphic" type="saturate" values="6"/></filter>
        <filter id="s4"><feColorMatrix in="SourceGraphic" type="saturate" values="8"/></filter>
        <filter id="s5"><feColorMatrix in="SourceGraphic" type="saturate" values="10"/></filter>
        <filter id="s6"><feColorMatrix in="SourceGraphic" type="saturate" values="12"/></filter>
        <filter id="s7"><feColorMatrix in="SourceGraphic" type="saturate" values="14"/></filter>
        <filter id="s8"><feColorMatrix in="SourceGraphic" type="saturate" values="16"/></filter>
        <filter id="s9"><feColorMatrix in="SourceGraphic" type="saturate" values="18"/></filter>
        <filter id="s10"><feColorMatrix in="SourceGraphic" type="saturate" values="20"/></filter>
        <filter id="r1"><feColorMatrix in="SourceGraphic" type="hueRotate" values="20"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r2"><feColorMatrix in="SourceGraphic" type="hueRotate" values="40"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r3"><feColorMatrix in="SourceGraphic" type="hueRotate" values="60"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r4"><feColorMatrix in="SourceGraphic" type="hueRotate" values="80"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r5"><feColorMatrix in="SourceGraphic" type="hueRotate" values="100"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r6"><feColorMatrix in="SourceGraphic" type="hueRotate" values="120"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r7"><feColorMatrix in="SourceGraphic" type="hueRotate" values="140"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r8"><feColorMatrix in="SourceGraphic" type="hueRotate" values="160"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r9"><feColorMatrix in="SourceGraphic" type="hueRotate" values="180"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
        <filter id="r10"><feColorMatrix in="SourceGraphic" type="hueRotate" values="200"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>
    </svg>
}

export default Filters;