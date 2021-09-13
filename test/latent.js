const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);

const _ = {
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
    const cap = await getCapForID(tokenId)
    let htmlstring = '';

    while(i <= cap){
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
        Name: ${metadata.name}
        Description: ${metadata.description}
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

async function getAvailableToMint(tokenId){
  const remaining = await _.contract.getAvailableToMint(tokenId);
  return remaining.toNumber();
}

async function getCapForID(tokenId){
  const cap = await _.contract.getCapForID(tokenId);
  return cap.toNumber();
}


describe("Contract", async function(){

  it(`should deploy`, async function(){
    
    Latent = await ethers.getContractFactory("Latent");
    _.contract = await Latent.deploy();
    expect(_.contract).to.be.an('object')

  });

  async function testToken(tokenId){

    it(`should create`, async function(){
        
      const create_tx = await _.contract.create();
      const create_receipt = await create_tx.wait();
      const id = create_receipt.events[0].args.id.toNumber();
      expect(id).to.equal(tokenId);

    });

    describe('getCapForID()', function(){

      it('should return a number larger than 0', async function(){
        const cap = await getCapForID(tokenId)
        expect(cap).to.be.greaterThan(0);
      })

    });

    describe('getAvailableToMint()', function(){
      
      it('should return a number', async function(){
      
        const cap = await getCapForID(tokenId)
        const remaining = await getAvailableToMint(tokenId);
        expect(remaining).to.be.lessThan(cap)
  
      });
  
      it('should be less than capacity', async function(){
      
        const cap = await getCapForID(tokenId)
        const remaining = await getAvailableToMint(tokenId);
        expect(remaining).to.be.lessThan(cap)
  
      });
  
    })


    it(`Mint remaining editions`, async function(){

      const cap = await getCapForID(tokenId);

      while(await getAvailableToMint(tokenId) > 0){
        await _.contract.mint(tokenId)
        // console.log(`${await getAvailableToMint(tokenId)} mints left for token ${tokenId} with cap ${cap}`);
      }

      expect(await getAvailableToMint(tokenId)).to.equal(0);

    });


    it(`Revert on attempt to mint more editions than available`, async function(){

      try {

        let i = 1;
        const remaining = await getAvailableToMint(tokenId)+1;
        while(i <= remaining){
          await _.contract.mint(tokenId);
          i++
        }

      }
      catch(error){
        expect(error).to.be.an('error');
      }
            
    });


    it(`Read tokenURI for ID ${tokenId}`, async function(){
      
      metadata = await getMetaData(tokenId);
      // tokenId = uri_receipt.events[0].args.tokenId.toNumber();
      
      expect(metadata.name).to.be.a('string');
  
    });

  }

  describe("Token 1", async () => await testToken(1))
  describe("Token 2", async () => await testToken(2))
  describe("Token 3", async () => await testToken(3))
  describe('Make preview', async function(){
    it('should work', async function(){
      await makePreview([1,2,3]);
    });
  })

});
