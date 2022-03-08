const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');

describe("00x0", async function(){

    let preview;
    let contract;
    let owner;
    let wallet1;
    let wallet2;
    let wallet3;
    let minter1;
    let minter2;
    let minter3;

    const seeds = [
        [54, 5, 3, 1, 63, 6]
    ];

  
    it('should deploy', async function () {

        const LatentWorks_00x0 = await hre.ethers.getContractFactory("LatentWorks_00x0");
        contract = await LatentWorks_00x0.deploy();
        [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();

        minter1 = await contract.connect(wallet1);
        minter2 = await contract.connect(wallet2);
        minter3 = await contract.connect(wallet3);
        preview = new Preview(contract);
        
    });

    describe('Holder', async function(){
        
        it('should be able to create comps from works', async function(){

            for (let i = 0; i < seeds.length; i++) {
                await contract.create(seeds[i]);
                expect(await contract.getAvailable(i+1) == seeds[i].count -1);
            }

        })

    })

    describe('Generates', async function(){
        it('artwork', async function(){
            this.timeout(120000);
            for (let i = 0; i < seeds.length; i++) {
                await preview.writeArtwork(i+1);
            }
        });    
    })

});