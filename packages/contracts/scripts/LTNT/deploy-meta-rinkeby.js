const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");
const Verify = require('../verify.js');

const NETWORK = 'rinkeby';
const ADDRESS_LTNT = '0xeda5410E64DDf924dC10B1b0B4Ed37B1876728e1';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);
  const verify = Verify(networkName);

  const LTNT_Meta = await hre.ethers.getContractFactory("LTNT_Meta");
  _ltnt_meta = await LTNT_Meta.deploy(ADDRESS_LTNT, '0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf', '0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9');
  await _ltnt_meta.deployed();
  verify.add(_ltnt_meta.address);

  /// LW00x0
  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.attach(ADDRESS_LTNT);
  await _ltnt.deployed();
  await _ltnt.setMetaContract(_ltnt_meta.address);

  console.log('Done!');
  console.log('Verify command:')
  console.log(verify.command)
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
