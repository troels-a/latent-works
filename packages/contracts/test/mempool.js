
const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');

const MINT_MAX = 9;


describe('mempool', async function(){

    let _mempool, preview_dir;
    
    it('init', async function(){

        const LWMempool = await hre.ethers.getContractFactory("LWMempool");
        _mempool = await LWMempool.deploy();
        await _mempool.deployed();

        preview_dir = `${path}/temp/preview`;
        base_dir = `${path}/temp/base/color`;
        await fs.promises.mkdir(preview_dir, {recursive: true}).catch(console.error);
        const files = await fs.readdirSync(base_dir);
        
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

    it('generates', async function(){
        
        this.timeout(500000);

        const pool_id = 1;
        const increase = await _mempool.getEpochLength(pool_id);

        let epoch = await _mempool.getCurrentEpoch(pool_id);
        let i = 1;
        let max_epochs = await _mempool.MAX_EPOCHS();
        max_epochs = max_epochs.toNumber();

        while(epoch.toNumber() <= max_epochs){
            epoch = await _mempool.getCurrentEpoch(pool_id);
            console.log(i, epoch.toNumber());
            const svg = await _mempool.getEpochImage(pool_id, epoch, false);
            await fs.writeFileSync(`${preview_dir}/mempool_${pool_id}_${epoch}.svg`, svg, {flag: 'w'});
            await network.provider.send("evm_increaseTime", [increase.toNumber()])
            await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
            i++;
        }

    });


})