
const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');
const generateSheet = require("./mempools/sheet.js");
// const generateSVG = require("./mempools/svg.js");

const LTNT_ADDRESS = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';

describe('mempools', async function(){

    let _mempools, preview_dir, base_dir, minted = 0, PRICE, MAX_MINTS;
    
    it('init', async function(){


        preview_dir = `${path}/temp/preview`;
        base_dir = `${path}/test/mems`;

        let pools = await fs.readdirSync(base_dir, { withFileTypes: true });
        pools = pools.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
        const banks = [];

        const filters = ['bw', 's1', 'r2', 'none', 'bw', 's5', 'r6', 'none', 'bw', 's10', 'r10', 'none'];
        let filter_index = 0;

        for (let pool = 0; pool < pools.length; pool++) {

            const name = pools[pool].split('-')[0];
            const filter = pools[pool].split('-')[1];
            const pool_dir = `${base_dir}/${pools[pool]}`;
            
            await fs.promises.mkdir(preview_dir, {recursive: true}).catch(console.error);
            let files = await fs.readdirSync(pool_dir);

            const parts = await Promise.all(files.filter(file => file.match(/.jpg$/i)).map(async file => {
                const filepath = `${pool_dir}/${file}`;
                const file_buffer = await fs.readFileSync(filepath);
                const base = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
                return base;
            }))

            
            banks.push([name, parts, filter ? filter : filters[filter_index]]);
            filter_index++;
            if(filter_index >= filters.length) filter_index = 0;

        }

        const LWMempools = await hre.ethers.getContractFactory("LWMempools");
        _mempools = await LWMempools.deploy(LTNT_ADDRESS);
        await _mempools.deployed();

        const LWMempools_Meta = await hre.ethers.getContractFactory("LWMempools_Meta");
        const meta_address = await _mempools.getMeta();
        _mempools_meta = await LWMempools_Meta.attach(meta_address);
        await _mempools_meta.deployed();

        for(let i = 0; i < banks.length; i++) {
            await _mempools.addBank(...banks[i]);
        }

        const _ltnt = await hre.ethers.getContractAt("LTNT", LTNT_ADDRESS);
        await _ltnt.addIssuer(_mempools.address);

        PRICE = await _mempools.PRICE();
        MAX_MINTS = 15;

    })

    it('mints', async function(){

        let bank_count = await _mempools.getBankCount();
        bank_count = bank_count.toNumber();
        while(bank_count > 0){

            const bank_index = bank_count-1;

            let i = 0;
            while(i < MAX_MINTS){
                await _mempools.mint(bank_index, i, {value: PRICE});
                minted++;
                i++;
            }
    
            bank_count--;
        }
    })


    it('generates all pools', async function(){
        
        this.timeout(500000);

        const preview = new Preview(_mempools);

        const sheet = {
            filename: 'pools.html',
            title: 'Mempools',
            items: [],
            dir: preview_dir,
            bgcolor: 'white',
            txtcolor: 'black',
            columns: 5
        }


        await network.provider.send("evm_increaseTime", [60*60*24*365*1]);
        await network.provider.send("evm_mine");

        const resolveAll = [];
        let i = 1;
        while(i <= minted){
            // console.log(i)
            const tokenURI = await _mempools.tokenURI(i);

            const json = Buffer.from(tokenURI.replace(/^data\:application\/json\;base64\,/, ''), 'base64').toString('utf-8');
            const meta = JSON.parse(json);
                
            let epoch = 10;
            meta.attributes.map(attr => {
                if(attr.trait_type == 'epoch')
                    epoch = attr.value
            });

            const svg = Buffer.from(meta.image.replace(/^data\:image\/svg\+xml\;base64\,/, ''), 'base64').toString('utf-8');

            // const svg = await _mempools.getEpochImage(i, epoch, false);
            const image_file = `${preview_dir}/mempool_${i}.svg`;
            const json_file = `${preview_dir}/mempool_${i}.json`;
            
            await fs.writeFileSync(image_file, svg, {flag: 'w'});
            await fs.writeFileSync(json_file, json, {flag: 'w'});
            
            sheet.items.push({
                src: image_file,
                label: `mempool ${i}`,
                url: json_file
            })

            console.log('Generated mempool', i);

            i++;

        }

        await Promise.all(resolveAll);
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

    //     const pool_id = 63;
    //     const increase = await _mempools.getEpochLength(pool_id);

    //     let epoch = 0

    //     const max_epochs = 30;
    //     while(epoch < max_epochs){
            
    //         epoch = await _mempools.getCurrentEpoch(pool_id);
    //         epoch = epoch.toNumber();
    //         console.log(pool_id, epoch);

    //         const svg = await _mempools_meta.getEpochImage(pool_id, epoch, false);
    //         const filename = `${preview_dir}/mempool_${pool_id}_${epoch}.svg`;
            
    //         await fs.writeFileSync(filename, svg, {flag: 'w'});
            
    //         sheet.items.push({
    //             src: filename
    //         })
            
    //         await network.provider.send("evm_increaseTime", [increase.toNumber()]);
    //         await network.provider.send("evm_mine");
            

    //     }

    //     await generateSheet(sheet)

    // });


})