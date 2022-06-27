const hre = require("hardhat");
const networkName = hre.network.name;
const fs = require('fs');
const path = require('path').dirname(__dirname);
require("colors");

const ADDRESS_LTNT = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';

async function main() {

  if(networkName !== 'localhost'){
    console.log(`NOT LOCALHOST! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO LOCALHOST'.bgGreen);

  /// BASES
  preview_dir = `${path}/temp/preview`;
  base_dir = `${path}/mempools/mems`;

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


  /// MEMPOOLS
  const LWMempools = await hre.ethers.getContractFactory("LWMempools");
  _mempools = await LWMempools.deploy(ADDRESS_LTNT, bases);
  await _mempools.deployed();

  console.log('Mempools deployed to: '._mempools.address.green)

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
