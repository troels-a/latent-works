const { task } = require("hardhat/config");
const { types } = require("hardhat/config")
const fs = require('fs');
const path = require('path').dirname(__dirname);

require("colors");

task("mempools:deploy", "Deploy mempool contract", async (taskArgs, hre) => {

  await hre.run('compile');
  console.log(`Deploying mempools to network ${hre.network.name}`);

  base_dir = `${path}/contracts/test/oldie`;

  let pools = await fs.readdirSync(base_dir, { withFileTypes: true });
  pools = pools.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
  const bases = [];

  for (let pool = 0; pool < pools.length; pool++) {

      const name = pools[pool];
      const pool_dir = `${base_dir}/${name}`;
      
      let files = await fs.readdirSync(pool_dir);
      const parts = await Promise.all(files.filter(file => file.match(/.jpg$/i)).map(async file => {
          const filepath = `${pool_dir}/${file}`;
          const file_buffer = await fs.readFileSync(filepath);
          const base = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
          return base;
      }))

      bases.push([name, parts]);
  }


  const LWMempools = await hre.ethers.getContractFactory("LWMempools");
  const mempools = await LWMempools.deploy(process.env.ADDRESS_LTNT, bases);
  await mempools.deployed();

  console.log("mempools deployed to:", mempools.address.green.bold);

});


task("ltnt:add-issuer", "Add issuer to contract", async ({address}, hre) => {

    const LTNT = await hre.ethers.getContractFactory("LTNT");
    const ltnt = await LTNT.attach(process.env.ADDRESS_LTNT);
    await ltnt.deployed();

    await ltnt.addIssuer(address);

    const issuer = await ltnt.getIssuers().then(res => res[res.length-1]);

    console.log(`Issuer ${issuer} added to contract`);
    
})
.addParam('address', types.Address, "Address of issuer")
