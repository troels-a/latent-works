import themeBase from "./themeBase";

const colors = {
    main: 'rgba(0,0,0,1)',
    main_dimmed: 'rgba(0,0,0,0.5)',
    white: 'rgba(255,255,255,1)',
    bg: 'rgba(0,0,0,1)',
    altBg: '#ececec',
    text: 'rgba(255,255,255,0.85)',
    modalBg: 'rgba(0,0,0,.7)',
    emph1: 'rgba(255,255,255,.02)',
    emph2: 'rgba(255,255,255,.04)',
    emph3: 'rgba(255,255,255,.06)',
    emph4: 'rgba(255,255,255,.08)',
    emph5: 'rgba(255,255,255,.10)',
    emph6: 'rgba(255,255,255,.12)',
    emph7: 'rgba(255,255,255,.14)',
    emph8: 'rgba(255,255,255,.16)',
    emph9: 'rgba(255,255,255,.18)',
}

const dark = {...themeBase, colors};

export default dark;