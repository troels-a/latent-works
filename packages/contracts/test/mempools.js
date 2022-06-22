
const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');
const generateSheet = require("./mempools/sheet.js");
const generateSVG = require("./mempools/svg.js");

const MINT_MAX = 64;
const LTNT_ADDRESS = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';

describe('mempools', async function(){

    let _mempools, preview_dir, base_dir;
    
    it('init', async function(){

        
        preview_dir = `${path}/temp/preview`;
        base_dir = `${path}/test/oldie`;

        let pools = await fs.readdirSync(base_dir, { withFileTypes: true });
        pools = pools.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
        const bases = [];

        for (let pool = 0; pool < pools.length; pool++) {

            const name = pools[pool];
            const pool_dir = `${base_dir}/${name}`;
            
            await fs.promises.mkdir(preview_dir, {recursive: true}).catch(console.error);
            let files = await fs.readdirSync(pool_dir);

            const parts = await Promise.all(files.filter(file => file.match(/.jpg$/i)).map(async file => {
                const filepath = `${pool_dir}/${file}`;
                const file_buffer = await fs.readFileSync(filepath);
                const base = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
                return base;
            }))

            bases.push([name, parts]);
        }

        const LWMempools = await hre.ethers.getContractFactory("LWMempools");
        _mempools = await LWMempools.deploy(LTNT_ADDRESS, bases);
        await _mempools.deployed();

        const LWMempools_Meta = await hre.ethers.getContractFactory("LWMempools_Meta");
        _mempools_meta = await LWMempools_Meta.attach(await _mempools._meta());
        await _mempools_meta.deployed();


    })

    it('mints', async function(){
        let i = 1;
        while(i <= MINT_MAX){
            await _mempools.mint({value: ethers.utils.parseEther('0.1')});
            i++;
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
            columns: 8
        }


        // await network.provider.send("evm_increaseTime", [60*60*24*365*10]);
        // await network.provider.send("evm_mine");

        const resolveAll = [];
        let i = 1;
        while(i <= MINT_MAX){

            console.log(i);
            const tokenURI = await _mempools.tokenURI(i);

            let json = JSON.parse(Buffer.from(tokenURI.replace(/^data\:application\/json\;base64\,/, ''), 'base64').toString('utf-8'));
                
            let epoch = 0;
            json.attributes.map(attr => {
                if(attr.trait_type == 'epoch')
                    epoch = attr.value
            });

            const svg = Buffer.from(json.image.replace(/^data\:image\/svg+xml\;base64\,/, ''), 'base64').toString('utf-8');
    
            // const svg = await _mempools.getEpochImage(i, epoch, false);
            const image_file = `${preview_dir}/mempool_${i}.svg`;
            const json_file = `${preview_dir}/mempool_${i}.json`;
            
            await fs.writeFileSync(image_file, svg, {flag: 'w'});
            
            sheet.items.push({
                src: image_file,
                label: `mempool ${i}`,
                url: tokenURI
            })

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