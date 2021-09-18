const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);

const _ = {
  premint: ['0x3827014F2236519f1101Ae2E136985E0e603Be79']
};

async function writeSVG(tokenId, iteration){
  const svg = await _.contract.getSVG(tokenId, iteration);
  const svgDir = `./preview/svg/${tokenId}`;
  const jpgDir = `./preview/jpg/${tokenId}`;
  await fs.promises.mkdir(svgDir, { recursive: true }).catch(console.error);
  await fs.writeFileSync(`${svgDir}/${iteration}.svg`, svg, {flag: 'w'});
}

async function getMetaData(tokenId){
  let metadata = await _.contract.tokenURI(tokenId);
  metadata = Buffer.from(metadata.replace(/^data\:application\/json\;base64\,/, ''), 'base64');
  metadata = metadata.toString('utf-8');
  return JSON.parse(metadata);
}

async function makePreview(tokenIds){

  const dataItems = [];
  const htmlItems = [];

  await Promise.all(tokenIds.map(async tokenId => {
    
    let i = 1;
    const supply = await totalSupply(tokenId)
    // console.log('Supply', supply)
    let htmlstring = '';

    while(i <= supply){
      await writeSVG(tokenId, i);
      dataItems[tokenIds] = {
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

    const metadata = await getMetaData(tokenId);

    htmlItems[tokenId] = `<div>
        <div style="padding: 2vw; display: flex;">
        ${htmlstring}
        </div>
        <pre>
        ${JSON.stringify(metadata, null, 2)}
        </pre>
    </div>`;

  }))

  await fs.writeFileSync('./preview/index.html', `
    <html>
      <body style="width: 100vw; background-color: #ececec;">
      ${htmlItems.join()};
      </body>
    </html>
  `, {flag: 'w'});

  
  await fs.writeFileSync(`${path}/preview/svgexport.json`, JSON.stringify(dataItems), {flag: 'w'});

}


describe("LatentWorks", async function(){

  let contract;
  let owner;
  let wallet1;
  let wallet2;

  beforeEach(async function () {
    const LatentWorks = await hre.ethers.getContractFactory("LatentWorks");
    contract = await LatentWorks.deploy();
    [owner, wallet1, wallet2] = await hre.ethers.getSigners();
  });

  it(`should allow creation by anyone`, async function(){
    
    const user1 = await contract.connect(wallet1);
    const user2 = await contract.connect(wallet2);

    let i = 1;
    const max = await user1.MAX_WORKS();
    while(i <= max){
      await user1.create();
      i++;
    }

    expect(max).to.equal(77);
    expect(await user1.getCreated()).to.equal(max);

    await contract.releaseEdition();
    const current_edition = await contract.getCurrentEdition();

    await user1.mint({
      value: ethers.utils.parseEther("0.02"),
    });
    await user2.mint({
      value: ethers.utils.parseEther("0.02"),
    });

    expect(await current_edition).to.equal(2);
    expect(await user1.balanceOf(wallet1.address, 1)).to.equal(1);
    expect(await user2.balanceOf(wallet2.address, 2)).to.equal(1);

  });


});
