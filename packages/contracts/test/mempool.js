
const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');


describe('mempool', async function(){

    let _mempool, preview_dir;

    it('init', async function(){

        const LWMempool = await hre.ethers.getContractFactory("LWMempool");
        _mempool = await LWMempool.deploy();
        await _mempool.deployed();

        preview_dir = `${path}/temp/preview`;
        base_dir = `${path}/temp/base/pool`;
        await fs.promises.mkdir(preview_dir, {recursive: true}).catch(console.error);
        const files = await fs.readdirSync(base_dir);
        
        let i = 1;
        for (let i = 0; i < files.length; i++) {
            const file_buffer = await fs.readFileSync(`${base_dir}/${files[i]}`);
            const base = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
            await _mempool.addBase(base);
        }

    })

    it('generates', async function(){
        this.timeout(500000);

        const max = 9;
        let i = 1;

        while(i <= max){
            let svg = await _mempool.generateImage((new Date().getTime()*i)+'');
            await fs.writeFileSync(`${preview_dir}/mempool_${i}.svg`, svg, {flag: 'w'});
            i++;
        }

    });


})