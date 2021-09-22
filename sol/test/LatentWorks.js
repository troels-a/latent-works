const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);

const _ = {
  premint: ['0x3827014F2236519f1101Ae2E136985E0e603Be79']
};

async function writeSVG(contract, tokenId, iteration){
  let svg = await contract.getSVG(tokenId, iteration);
  const svgDir = `./preview/svg/${tokenId}`;
  svg = Buffer.from(svg.replace(/^data\:image\/svg\+xml\;base64\,/, ''), 'base64').toString('utf-8');
  await fs.promises.mkdir(svgDir, { recursive: true }).catch(console.error);
  await fs.writeFileSync(`${svgDir}/${iteration}.svg`, svg, {flag: 'w'});
}

async function getMetaData(contract, tokenId){
  let metadata = await contract.tokenURI(tokenId);
  metadata = Buffer.from(metadata.replace(/^data\:application\/json\;base64\,/, ''), 'base64');
  metadata = metadata.toString('utf-8');
  return JSON.parse(metadata);
}

async function makePreview(contract){

  const dataItems = [];
  const htmlItems = [];
  const minted = await contract.getMinted();
  let tokenId = minted < 77 ? minted : 77;

  while(tokenId > 0){
    
    let i = 1;
    const supply = await contract.totalSupply(tokenId)
    // console.log('Supply', supply)
    let htmlstring = '';

    while(i <= supply){
      await writeSVG(contract, tokenId, i);
      dataItems[tokenId] = {
        input: [
          `${path}/preview/svg/${tokenId}/${i}.svg`,
        ],
        output: [
          [
          `${path}/preview/jpg/${tokenId}/${i}.jpg`,
          ]
        ]
      };

      htmlstring += `<div style="margin:2vw; width: 10vw;"><img src="svg/${tokenId}/${i}.svg" style="width: 100%; height: auto;"/></div>`;
      i++;
    }

    let metadata = await getMetaData(contract, tokenId);

    htmlItems[tokenId] = `<div>
        <div style="padding: 2vw; display: flex;">
        ${htmlstring}
        </div>
        <pre>
        ${JSON.stringify(metadata, null, 2)}
        </pre>
    </div>`;

    tokenId--;

  } 


  await fs.writeFileSync('./preview/index.html', `
    <html>
      <body style="width: 100vw; background-color: #ececec;">
      ${htmlItems.join()};
      </body>
    </html>
  `, {flag: 'w'});

  return;
  
  // await fs.writeFileSync(`${path}/preview/svgexport.json`, JSON.stringify(dataItems), {flag: 'w'});

}


describe("LatentWorks", async function(){

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

  it('should deploy', async function () {

    const LatentWorks = await hre.ethers.getContractFactory("LatentWorks");
    contract = await LatentWorks.deploy();
    [owner, wallet1, wallet2, wallet3] = await hre.ethers.getSigners();
    minter1 = await contract.connect(wallet1);
    minter2 = await contract.connect(wallet2);
    minter3 = await contract.connect(wallet3);
    max_works = await contract.MAX_WORKS();
    max_editions = await contract.MAX_editions();

    expect(max_editions).to.be.an('integer');
    expect(max_works).to.be.an('integer');
    expect(await contract.getCurrentEdition()).to.equal('');

  });


      it('edition 1 should be released', async function(){
        await contract.releaseEdition();
        const current_edition = await contract.getEditions();
        expect(current_edition).to.equal(1);
        expect(await contract.getAvailable()).to.equal(77*_edition);
      });
    
      it(`should be mintable by anyone`, async function(){
        
        let i = 1;
        const max = await minter1.MAX_WORKS();
        expect(max).to.equal(77);
    
        while(i <= max){
          await minter1.mint({
            value: ethers.utils.parseEther("0.07"),
          });
          i++;
        }
    
        expect(await contract.getMinted()).to.equal(max);
        expect(await contract.getAvailable()).to.equal(0);
    
      });

      it('edition 2 should be released', async function(){
        await contract.releaseEdition();
        const current_edition = await contract.getEditions();
        expect(current_edition).to.equal(2);
        expect(await contract.getAvailable()).to.equal(77*_edition);
      });

      it(`should be mintable by anyone`, async function(){
        
        let i = 1;
        const max = await minter1.getAvailable();
        expect(max).to.equal(77);
    
        while(i <= max){
          await minter1.mint({
            value: ethers.utils.parseEther("0.07"),
          });
          i++;
        }
    
        expect(await contract.getMinted()).to.equal(max*2);
        expect(await contract.getAvailable()).to.equal(0);
    
      });


      it('should have deterministic output', async function(){

        const i = 1;
        const uri1 = await contract.tokenURI(i);
        const uri2 = await contract.tokenURI(i);
        expect(uri1).to.match(/^data:/);
        expect(uri2).to.match(/^data:/);

        const [pre1, base64_1] = uri1.split(",");
        const [pre2, base64_2] = uri2.split(",");
        const json1 = JSON.parse(Buffer.from(base64_1, "base64").toString("utf-8"));
        const json2 = JSON.parse(Buffer.from(base64_2, "base64").toString("utf-8"));
        expect(json1["image"]).to.equal(json2["image"]);
        
      });


      it('remaining editions should be released', async function(){

        let i = 1;
        let tokens = 5;
        while(i <= tokens){
          await contract.releaseEdition();
          const current_edition = await contract.getEditions();
          expect(current_edition).to.equal(i+2);
          expect(await contract.getAvailable()).to.equal(77*i);
          i++;
        }

      });

      it(`should be mintable by anyone`, async function(){
        
        let i = 1;
        const max = await minter1.getAvailable();
        expect(max).to.equal(77*5);
    
        while(i <= max){
          await minter1.mint({
            value: ethers.utils.parseEther("0.07"),
          });
          i++;
        }

        expect(await contract.getMinted()).to.equal(77*7);
        expect(await contract.getAvailable()).to.equal(0);
    
      });

      // it('should generate preview', async function(){
      //   this.timeout(120000);
      //   await makePreview(contract);
      // });


  // it('should release edition '+_edition, async function(){
  //   await contract.releaseEdition();
  //   const current_edition = await contract.getEditions();
  //   expect(current_edition).to.equal(2);
  //   expect(await contract.getAvailable()).to.equal(77);
  // });

  // it(`should allow creation by anyone`, async function(){
    
  //   let i = 1;
  //   const max = await minter1.MAX_WORKS();
  //   expect(max).to.equal(77);

  //   while(i <= max){
  //     await minter1.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     i++;
  //   }

  //   expect(await contract.getMinted()).to.equal(max);
  //   expect(await contract.getAvailable()).to.equal(0);

  // });

  // it('should release '++' edition', async function(){
  //   await contract.releaseEdition();
  //   const current_edition = await contract.getEditions();
  //   expect(current_edition).to.equal(2);
  //   expect(await contract.getAvailable()).to.equal(77);
  // });

  // it('should allow anyone to mint 2nd edition', async function(){

  //   let i = 1;
  //   const max = await contract.MAX_WORKS();
  //   user2 = await contract.connect(wallet2);

  //   while(i <= max){
  //     await minter2.mint({
  //       value: ethers.utils.parseEther("0.07"),
  //     });
  //     expect(await minter2.balanceOf(wallet1.address, i)).to.equal(1);
  //     i++;
  //   }

  // });


  // it('should have meta data', async function(){

  //   const i = 1;
  //   const uri = await contract.tokenURI(i);
  //   expect(uri).to.match(/^data:/);

  //   const [pre, base64] = uri.split(",");
  //   const json = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  //   expect(json["image"]).to.match(/^data:image\/svg/);
    
  // });


  // it('should revert on unreleased edition', async function(){

  //   let i = 1;
  //   const max = await contract.MAX_WORKS();
  //   user2 = await contract.connect(wallet2);

  //   while(i <= max){
  //     expect(contract.getSVG(i, 3)).to.be.revertedWith("NOT_MINTED");
  //     i++;
  //   }

  // });


});
