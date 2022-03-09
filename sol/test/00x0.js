const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');

describe("00x0", async function(){

    let preview;
    let contract;
    let _77x7;
    let owner;
    let wallet1;
    let wallet2;
    let wallet3;
    let minter1;
    let minter2;
    let minter3;

    const seeds = [
        [54, 5, 1, 3],
        [6, 63]
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

        const LatentWorks_77x7 = await hre.ethers.getContractFactory("LatentWorks_77x7");
        _77x7 = LatentWorks_77x7.attach('0xEF7c89F051ac48885b240eb53934B04fcF3339ab');

        const LatentWorks_00x0 = await hre.ethers.getContractFactory("LatentWorks_00x0");
        contract = await LatentWorks_00x0.deploy();
        [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();

        minter1 = await contract.connect(wallet1);
        minter2 = await contract.connect(wallet2);
        minter3 = await contract.connect(wallet3);
        preview = new Preview(contract);
        
    });

    describe('77x7 holder', async function(){
        
        it('can transfer works', async function(){

            for (let i = 0; i < seeds.length; i++) {
                await _77x7.safeBatchTransferFrom(owner.address, contract.address, seeds[i], values[i], []);
                expect(await contract.getAvailable(i+1) == seeds[i].length -1);
            }
            

        })

        it('receives 00x0 after transfer', async function(){
            for (let i = 0; i < seeds.length; i++) {
                expect(await contract.balanceOf(owner.address, i+1)).to.equal(1);
            }
        });

    })

    describe('Anon', async function(){

        it('can mint 00x0', async function(){

            for (let i = 0; i < seeds.length; i++) {
                
                const seed = seeds[i];
                const id = i+1;
                const avail = await minter1.getAvailable(id);
                const price = await minter1.getPrice(id);

                console.log(`       ID: ${id}`);
                console.log(`       Available: ${avail.toString()}`);
                console.log(`       Price: ${hre.ethers.utils.formatUnits(price.toString())}`);

                let ii = 0; 
                while(ii < avail){
                    await minter1.mint(id, {value: price});
                    ii++
                }

                await expect(minter1.mint(id, {value: price})).to.be.revertedWith('UNAVAILABLE');

            }

        });

    });

    describe('Generates', async function(){
        
        it('artwork', async function(){
            this.timeout(120000);
            for (let i = 0; i < seeds.length; i++) {
                await preview.writeArtwork(i+1);
            }
        });

        it('json', async function(){
            this.timeout(120000);
            for (let i = 0; i < seeds.length; i++) {
                await preview.writeJSON(i+1);
            }
        });
    })

});