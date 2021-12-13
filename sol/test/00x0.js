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
  
    let _edition = 1;

    it('should deploy', async function () {

        const LatentWorks_00x0 = await hre.ethers.getContractFactory("LatentWorks_00x0");
        contract = await LatentWorks_00x0.deploy();
        [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();

        minter1 = await contract.connect(wallet1);
        minter2 = await contract.connect(wallet2);
        minter3 = await contract.connect(wallet3);
        preview = new Preview(contract);

        
    });

});