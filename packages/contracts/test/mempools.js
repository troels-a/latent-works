
const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');
const generateSheet = require("./mempools/sheet.js");
const generateSVG = require("./mempools/svg.js");

const MINT_MAX = 64;


describe('mempool', async function(){

    let _mempool, preview_dir;
    
    it('init', async function(){

        const LWMempool = await hre.ethers.getContractFactory("LWMempool");
        _mempool = await LWMempool.deploy();
        await _mempool.deployed();

        preview_dir = `${path}/temp/preview`;
        base_dir = `${path}/test/mempools/gold-1c`;
        await fs.promises.mkdir(preview_dir, {recursive: true}).catch(console.error);
        let files = await fs.readdirSync(base_dir);
        files = files.filter(file => file.match(/.jpg$/i))
        console.log(files);
        let i = 1;
        for (let i = 0; i < files.length; i++) {
            const file_buffer = await fs.readFileSync(`${base_dir}/${files[i]}`);
            const base = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
            await _mempool.addBase(base);
        }

    })

    it('mints', async function(){
        let i = 1;
        while(i <= MINT_MAX){
            await _mempool.mint();
            i++;
        }
    })


    it('generates all pools', async function(){
        
        this.timeout(500000);

        const sheet = {
            filename: 'pools.html',
            title: 'Mempools',
            items: [],
            dir: preview_dir,
            bgcolor: 'black',
            columns: 8
        }


        await network.provider.send("evm_increaseTime", [60*60*25*365*3]);
        await network.provider.send("evm_mine");


        let i = 1;
        while(i <= MINT_MAX){
            
            epoch = await _mempool.getCurrentEpoch(i);
            epoch = epoch.toNumber();
            console.log(i);

            const svg = await _mempool.getEpochImage(i, epoch, false);
            const filename = `${preview_dir}/mempool_${i}.svg`;
            
            await fs.writeFileSync(filename, svg, {flag: 'w'});
            
            sheet.items.push({
                src: filename,
                label: `Pool ${i}`
            })

            i++;

        }

        await generateSheet(sheet)
        // sheet.filename = 'pools.svg';
        // sheet.columns = 4;
        // await generateSVG(sheet)

    });

    // it('generates epochs', async function(){
        
    //     this.timeout(500000);

    //     const sheet = {
    //         filename: 'epochs.html',
    //         title: 'Mempool #1 - epochs',
    //         items: [],
    //         dir: preview_dir,
    //         bgcolor: 'black',
    //         columns: 5
    //     }

    //     const pool_id = 1;
    //     const increase = await _mempool.getEpochLength(pool_id);

    //     let epoch = 0

    //     let max_epochs = await _mempool.MAX_EPOCHS();
    //     max_epochs = max_epochs.toNumber();
    //     // let max_epochs = 5;
    //     console.log(max_epochs);

    //     while(epoch < max_epochs){
            
    //         epoch = await _mempool.getCurrentEpoch(pool_id);
    //         epoch = epoch.toNumber();
    //         console.log(pool_id, epoch);

    //         const svg = await _mempool.getEpochImage(pool_id, epoch, false);
    //         const filename = `${preview_dir}/mempool_${pool_id}_${epoch}.svg`;
            
    //         await fs.writeFileSync(filename, svg, {flag: 'w'});
            
    //         sheet.items.push({
    //             src: filename,
    //             label: `epoch ${epoch}`
    //         })
            
    //         await network.provider.send("evm_increaseTime", [increase.toNumber()]);
    //         await network.provider.send("evm_mine");
            

    //     }

    //     await generateSheet(sheet)

    // });


})