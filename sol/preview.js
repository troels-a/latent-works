const fs = require('fs');
const path = require('path').dirname(__dirname);

class Preview {


    constructor(contract){
        this.contract = contract;
    }

    async writeSVG(tokenId, iteration){
        let svg = await this.contract.getSVG(tokenId, iteration, true);
        const svgDir = `./preview/svg/${tokenId}`;
        svg = Buffer.from(svg.replace(/^data\:image\/svg\+xml\;base64\,/, ''), 'base64').toString('utf-8');
        await fs.promises.mkdir(svgDir, { recursive: true }).catch(console.error);
        await fs.writeFileSync(`${svgDir}/${iteration}.svg`, svg, {flag: 'w'});
    }
    
    async getMetaData(tokenId){
        let metadata = await this.contract.uri(tokenId);
        metadata = Buffer.from(metadata.replace(/^data\:application\/json\;base64\,/, ''), 'base64');
        metadata = metadata.toString('utf-8');
        return JSON.parse(metadata);
    }
    
    async generate(startToken = 1, endToken = 77){
        
        const dataItems = [];
        const htmlItems = [];
        const minted = await this.contract.getMinted();
        const max = endToken;
        let t = startToken;

        while(t <= max){
            
            let i = 1;
            const supply = await this.contract.totalSupply(t)

            let htmlstring = `<div class="work-id">Work #${t}</div>`;
            
            while(i <= supply){

                await this.writeSVG(t, i);
                htmlstring += `<div class="work">
                    <img src="svg/${t}/${i}.svg" style="width: 100%; height: auto;"/>
                    <small>Work #${t} | ${i}/${supply}</small>
                </div>`;
                i++;
                
            }
            
            let metadata = await this.getMetaData(t);
            
            htmlItems[t] = `
                <div class="grid works">
                    ${htmlstring}
                </div>
            `;
            
            t++;
            
        } 
        
        
        await fs.writeFileSync('./preview/index.html', `
        <html>
        <head>
            <style>

                body {
                    font-family: monospace;
                    font-size: 1vw;
                    width: 100vw;
                    background-color: #ececec;
                }

                .x, .y {
                    position: absolute;
                    top: 2vw;
                    height: 2vw;
                }

                .x {
                    margin-left: 2vw;
                }

                .grid {
                    display: flex;
                }

                .grid > div {
                    width: 12.5vw;
                    padding: 0.5vw;
                }

                .y {
                    transform: rotate(90deg);
                    margin-top: 4vh;
                    margin-right: 2vw;

                }

                .works {
                    margin: 4vw 0 0 2vw;
                }

                .work {
                    color: grey;
                }

                .work small {
                    display: inline-block;
                    margin-top: 0.5vw;
                }

                .work-id {
                    transform: rotate(-90deg);
                    position: absolute;
                    left: -5vw;
                    margin-top: 5.2vw;
                }

            </style>
        </head>
        <body>
        <div class="X grid">
            ${[1,2,3,4,5,6,7].map(i => `<div>Edition ${i}</div>`).join('')}
        </div>
        
        ${htmlItems.join('')}

        </body>
        </html>
        `, {flag: 'w'});
        
        return;
                
    } 

}

module.exports = Preview;