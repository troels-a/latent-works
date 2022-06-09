const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');

describe("Broken English", async function(){

    let preview;
    let _be;
    let _ltnt;
    let _ltnt_meta;
    let owner;
    let migrater;
    let wallet1;
    let wallet2;
    let wallet3;
    let minter1;
    let minter2;
    let minter3;

    const lines = [
        'The high fidelity',
        'the uncoordinated specks',
        'floating in the air',
        'already saturated with deep frequencies ',
        'light chirps on white beds',
        'whispers everywhere!',
        'images no circuit could conjure',
        'no mind imagine',
        'beams of benevolence',
        'reaches every corner',
        'of everything'
    ];
  
    it('should deploy', async function () {

        const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
        _xmrl = await XanhMonoRegularLatin.attach(process.env.ADDRESS_REGULAR);
        await _xmrl.deployed();
        const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
        _xmil = await XanhMonoItalicLatin.attach(process.env.ADDRESS_ITALIC);
        await _xmil.deployed();

        const LTNT = await hre.ethers.getContractFactory("LTNT");
        _ltnt = await LTNT.deploy(_xmrl.address, _xmil.address);
        await _ltnt.deployed();

        const LTNT_Meta = await hre.ethers.getContractFactory("LTNT_Meta");
        _ltnt_meta = LTNT_Meta.attach(await _ltnt.getMetaContract());
        await _ltnt_meta.deployed();

        const LWBrokenEnglish = await hre.ethers.getContractFactory("LWBrokenEnglish");
        _be = await LWBrokenEnglish.deploy(_ltnt.address, _xmrl.address, _xmil.address);
        await _be.deployed();
        await _ltnt.addIssuer(_be.address);

        [owner, user1, user2, user3] = await hre.ethers.getSigners();
        preview = new Preview(_be);
        
    });

    describe('contract', async function(){
        
        it('allows lines to be added', async function(){
            _be.addLines(lines);
            expect(await _be.getLineCount()).to.equal(lines.length);
        })

        it('allows anyone to mint', async function(){
            const price = await _be.PRICE()
            for (let i = 0; i < lines.length; i++) {
                await _be.mint(i+1, {value: price});
            }
        })

    })


    describe('Generate', async function(){
        

        it('assets', async function(){
            this.timeout(1200000);
            const preview_dir = `./temp/preview`;
            await fs.promises.mkdir(preview_dir, { recursive: true }).catch(console.error);
            for(let i = 0; i < lines.length; i++){
                await preview.writeArtwork(i+1);
                await preview.writeJSON(i+1);
            }
        });

    })


});