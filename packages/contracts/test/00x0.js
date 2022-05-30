const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');

describe("00x0", async function(){

    let preview;
    let _00x0;
    let _77x7;
    let owner;
    let migrater;
    let wallet1;
    let wallet2;
    let wallet3;
    let minter1;
    let minter2;
    let minter3;

    const seeds = [
        [1, 3, 63, 6, 54, 5]
    ];

    const values = [];

    for (let i = 0; i < seeds.length; i++) {
        let ii = 0;
        let seedValues = [];
        while(seeds[i].length > ii){
            seedValues.push(1);
            ii++;
        }
        values.push(seedValues);
    }
  
    it('should deploy', async function () {

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x3827014F2236519f1101Ae2E136985E0e603Be79"],
        });

        await network.provider.send("hardhat_setBalance", [
            "0x3827014F2236519f1101Ae2E136985E0e603Be79",
            "0x10000000000000000000000",
        ]);

        migrater = await ethers.getSigner("0x3827014F2236519f1101Ae2E136985E0e603Be79")

        const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
        _xmrl = await XanhMonoRegularLatin.deploy();
        await _xmrl.deployed();
        const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
        _xmil = await XanhMonoItalicLatin.deploy();
        await _xmil.deployed();

        // console.log('FONTS')
        // console.log(_xmrl.address)
        // console.log(_xmil.address)


        const LTNT = await hre.ethers.getContractFactory("LTNT");
        _ltnt = await LTNT.deploy(_xmrl.address, _xmil.address);
        await _ltnt.deployed();

        const LTNT_Meta = await hre.ethers.getContractFactory("LTNT_Meta");
        _ltnt_meta = LTNT_Meta.attach(await _ltnt.getMetaContract());
        await _ltnt_meta.deployed();

        const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
        _77x7 = LW77x7.attach('0xEF7c89F051ac48885b240eb53934B04fcF3339ab');
        await _77x7.deployed();

        const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
        _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.deploy(_77x7.address, _ltnt.address);
        await _77x7_ltnt_issuer.deployed();
        await _ltnt.addIssuer(_77x7_ltnt_issuer.address);

        const LW00x0 = await hre.ethers.getContractFactory("LW00x0");
        _00x0 = await LW00x0.deploy(_77x7.address, _77x7_ltnt_issuer.address, _ltnt.address);
        await _00x0.deployed();
        await _77x7_ltnt_issuer.setCaller(_00x0.address);
        await _ltnt.addIssuer(_00x0.address);

        const LW00x0_Meta = await hre.ethers.getContractFactory("LW00x0_Meta");
        _00x0_meta = LW00x0_Meta.attach(await _00x0._00x0_meta());
        await _00x0_meta.deployed();

        // const Issuer1 = await hre.ethers.getContractFactory("Issuer1");
        // _issuer1 = await Issuer1.deploy();
        // await _issuer1.deployed();
        // await _ltnt.addIssuer(_issuer1.address);
        
        // const Issuer2 = await hre.ethers.getContractFactory("Issuer2");
        // _issuer2 = await Issuer2.deploy();
        // await _issuer2.deployed();
        // await _ltnt.addIssuer(_issuer2.address);

        [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();

        minter1 = await _00x0.connect(wallet1);
        minter2 = await _00x0.connect(wallet2);
        minter3 = await _00x0.connect(wallet3);
        preview = new Preview(_00x0);
        
    });

    describe('77x7 holder', async function(){
        
        it('can transfer works', async function(){

            for (let i = 0; i < seeds.length; i++) {
                await _77x7.connect(migrater).safeBatchTransferFrom(migrater.address, _00x0.address, seeds[i], values[i], []);
                expect(await _00x0.getAvailable(i+1) == seeds[i].length -1);
            }

        })

        it('receives 00x0 after transfer', async function(){
            for (let i = 0; i < seeds.length; i++) {
                expect(await _00x0.balanceOf(migrater.address, i+1)).to.equal(1);
            }
        });

        it('receives LTNTs after transfer', async function(){
            
            let total  = 0;
            for (let i = 0; i < seeds.length; i++) {
                total += seeds[i].length;
            }
            expect(await _ltnt.balanceOf(migrater.address)).to.equal(total);

        });

    })

    describe('Anon', async function(){

        it('can mint 00x0', async function(){

            for (let i = 0; i < seeds.length; i++) {
                
                const seed = seeds[i];
                const id = i+1;
                const avail = await minter1.getAvailable(id);
                const price = await minter1.PRICE();

                let ii = 0; 
                while(ii < avail){
                    await minter1.mint(id, {value: price});
                    ii++
                }

                await expect(minter1.mint(id, {value: price})).to.be.revertedWith('UNAVAILABLE');

            }

        });

    });

    describe('Generate 00x0 assets', async function(){
        

        it('-', async function(){
            this.timeout(120000);
            const preview_dir = `./temp/preview`;
            await fs.promises.mkdir(preview_dir, { recursive: true }).catch(console.error);
            for(let i = 0; i < seeds.length; i++){
                let prev = await _00x0_meta.previewImage(migrater.address, seeds[i]);
                await fs.writeFileSync(`${preview_dir}/PREVIEW_${i+1}.svg`, prev, {flag: 'w'});
                await preview.writeArtwork(i+1);
                await preview.writeJSON(i+1);
            }
        });

    })


    describe("Generate LTNT assets", async function(){

        it("-", async function(){
            
            this.timeout(120000);

            const preview_dir = `./temp/preview`;
            await fs.promises.mkdir(preview_dir, { recursive: true }).catch(console.error);

            await _77x7_ltnt_issuer.connect(migrater).setIteration(3, 4);
            await expect(_77x7_ltnt_issuer.connect(wallet1).setIteration(3, 7)).to.be.revertedWith('NOT_OWNER');

            let i = 10;
            const max = 10;
            while(i <= max){
                let svg = await _ltnt_meta.getImage(i, false);
                await fs.writeFileSync(`${preview_dir}/LTNT_${i}.svg`, svg, {flag: 'w'});
                let json = await _ltnt.tokenURI(i);
                await fs.writeFileSync(`${preview_dir}/LTNT_${i}.json`, json, {flag: 'w'});
                i++;
            }

        })

    })

});