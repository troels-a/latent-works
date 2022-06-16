const fs = require('fs');
const path = require('path').dirname(__dirname);
const dim = 1000;
async function generateSVG({filename, items, dir, columns}){

    await fs.promises.mkdir(dir, {recursive: true}).catch(console.error);
    let x = -1000;
    let y = 0;
    let svg = `
    
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${columns*dim} ${columns*dim}" preserveAspectRatio="xMinYMin meet">
        ${items.map((item, i) => {
            
            if(x == dim*(columns-1)){
                x = 0;
                y = y+dim;
            }
            else{
                x = x+1000;
            }

            return `
            <image width="${dim}" height="${dim}" x="${x}" y="${y}" href="${item.src}"/>
        `}).join('')}

    </svg>

    `;

    await fs.writeFileSync(`${dir}/${filename}`, svg, {flag: 'w'});

}


module.exports = generateSVG;