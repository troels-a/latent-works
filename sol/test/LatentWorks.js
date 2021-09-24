const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');
console.log(Preview);

const _ = {
  premint: ['0x3827014F2236519f1101Ae2E136985E0e603Be79']
};



describe("LatentWorks", async function(){

  let preview;
  let contract;
  let owner;
  let max_works;
  let max_editions;
  let wallet1;
  let wallet2;
  let wallet3;
  let minter1;
  let minter2;
  let minter3;

  let _edition = 1;

  // Test deploy
  it('should deploy', async function () {

    const LatentWorks = await hre.ethers.getContractFactory("LatentWorks");
    contract = await LatentWorks.deploy();
    [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();
    minter1 = await contract.connect(wallet1);
    minter2 = await contract.connect(wallet2);
    minter3 = await contract.connect(wallet3);
    max_works = await contract.MAX_WORKS();
    max_editions = await contract.MAX_EDITIONS();
    preview = new Preview(contract);

    // expect(max_editions).to.equal(7);
    // expect(max_works).to.equal(77);
    expect(await contract.getCurrentEdition()).to.equal(0);
    expect(await contract.getEditions()).to.equal(0);

  });

  it('mint all and generate preview', async function(){

    this.timeout(120000);

    let e = 1;
    while(e <= max_editions){
      await contract.releaseEdition();
      e++;
    }

    expect(await contract.getEditions()).to.equal(max_editions);

    let i = 1;
    const available = await contract.getAvailable();

    while(i <= available){
      await contract.mint({
        value: ethers.utils.parseEther("0.07"),
      });
      i++;
    }

    expect(await contract.getCurrentEdition()).to.equal(max_editions);

    await preview.generate(1,3);

  });

  return true;

  // it('should revert when non-owner tries to releaseEdition', async function () {
  //   expect(minter2.releaseEdition()).to.be.revertedWith('Ownable: caller is not the owner');
  // });

  // it('release edition 1', async function(){

  //   await contract.releaseEdition();
  //   const editions = await contract.getEditions();

  //   expect(editions).to.equal(1);
  //   expect(await contract.getAvailable()).to.equal(77*editions);

  // });
  
  // it(`mint entire first edition`, async function(){
    
  //   let i = 1;
  //   const max = await minter1.getAvailable();
  
  //   while(i <= max){
  //     await minter1.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     i++;
  //   }
  
  //   expect(await contract.getMinted()).to.equal(max);
  //   expect(await contract.getAvailable()).to.equal(0);
  
  // });

  // it('edition 2 should be released', async function(){
  //   await contract.releaseEdition();
  //   const editions = await contract.getEditions();
  //   expect(editions).to.equal(2);
  //   expect(await contract.getAvailable()).to.equal(77*_edition);
  // });


  // it(`mint half of what's available`, async function(){
    
  //   let i = 1;
  //   const available = await minter1.getAvailable();
  //   expect(available).to.equal(77);

  //   const mint = Math.floor(available/2);

  //   while(i <= mint){
  //     await minter1.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     i++;
  //   }
  
  //   expect(await contract.getMinted()).to.equal(mint+77);
  //   expect(await contract.getAvailable()).to.equal(available - mint);
  //   expect(await contract.getCurrentEdition()).to.equal(2);

  // });


  // it(`mint remaining of what's available`, async function(){
    
  //   let i = 1;
  //   const available = await minter1.getAvailable();

  //   while(i <= available){
  //     await minter1.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     i++;
  //   }
  
  //   expect(await contract.getAvailable()).to.equal(0);
  //   expect(await contract.getCurrentEdition()).to.equal(2);

  // });



  // it('remaining editions should be released', async function(){

  //   let i = 1;
  //   let editions = 5;
  //   while(i <= editions){
  //     await contract.releaseEdition();
  //     const editions = await contract.getEditions();
  //     expect(editions).to.equal(i+2);
  //     expect(await contract.getAvailable()).to.equal(77*i);
  //     i++;
  //   }

  // });

  // it(`mint rest`, async function(){
    
  //   let i = 1;
  //   const max = await minter1.getAvailable();
  //   const minted = await contract.getMinted();
  //   expect(max).to.equal(77*5);
  
  //   while(i <= max){
  //     await minter1.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     const __minted = await contract.getMinted();
  //     const __current_edition = await contract.getCurrentEdition();
  //     // console.log(__minted.toNumber(), __current_edition.toNumber());
  //     i++;
  //   }

  //   expect(await contract.getCurrentEdition()).to.equal(7);
  //   expect(await contract.getMinted()).to.equal(77*7);
  //   expect(await contract.getAvailable()).to.equal(0);
  
  // });

  // it('should revert on trying to releaseEdition', async function(){
  //   expect(contract.releaseEdition()).to.be.revertedWith("MAX_EDITIONS_RELEASED");
  // });

  // it('should revert on trying to mint', async function(){
  //   expect(contract.mint({
  //     value: ethers.utils.parseEther("0.07"),
  //   })).to.be.revertedWith("NOT_AVAILABLE");
  // });


  // it('should have deterministic output', async function(){

  //   const i = 1;
  //   const uri1 = await contract.uri(i);
  //   const uri2 = await contract.uri(i);

  //   expect(uri1).to.match(/^data:/);
  //   expect(uri2).to.match(/^data:/);

  //   const [pre1, base64_1] = uri1.split(",");
  //   const [pre2, base64_2] = uri2.split(",");
  //   const json1 = JSON.parse(Buffer.from(base64_1, "base64").toString("utf-8"));
  //   const json2 = JSON.parse(Buffer.from(base64_2, "base64").toString("utf-8"));
  //   expect(json1["image"]).to.equal(json2["image"]);
    
  // });

  // it('should revert when non-owner tries to withdraw', async function(){
  //   expect(minter1.withdrawAll()).to.be.reverted;
  //   expect(minter2.withdrawAll()).to.be.reverted;
  // });


  // it('should generate preview', async function(){
  //   this.timeout(120000);
  //   await makePreview(contract);
  // });


});
