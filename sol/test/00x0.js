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
            const seeds = [50, 51, 52, 53, 54, 55];

            // const seeds = [77, 44, 33, 61, 2, 3];
            // const seeds = [5, 25];
            // const seeds = [8, 9, 77];
            // const seeds = [1, 54, 2, 3];
            // const seeds = [11,25,76];
            // const seeds = [3, 23, 76, 1, 4, 9]
            // const seeds = [4, 53, 5, 2]; !!!
            // const seeds = [45, 46, 47, 48, 49, 50, 51]; //!!!
            // const seeds = [1, 2, 3, 4, 5, 6, 7]; !!!
            // const seeds = [5,10,50,20]; !!!
            // const seeds = [74,3];
            // const seeds = [74,5,7];
            await contract.create([50, 51, 52, 53, 54, 55]);
            await contract.create([1, 2, 3, 4, 5, 6, 7]);
            await contract.create([5,10,50,20]);
            await contract.create([77, 44, 33, 61, 2, 3]);
            await contract.create([4, 53, 5, 2]);

            expect(await contract.getAvailable(1) == seeds.count);

        })

    })

    describe('Generates', async function(){
        it('artwork', async function(){
            this.timeout(120000);
            await preview.writeArtwork(1);
            await preview.writeArtwork(2);
            await preview.writeArtwork(3);
            await preview.writeArtwork(4);
            await preview.writeArtwork(5);
        });    
    })

});