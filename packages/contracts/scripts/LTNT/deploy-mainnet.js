const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");
const Verify = require('../verify.js');

const NETWORK = 'mainnet';
const REGULAR_ADDRESS = '0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf';
const ITALIC_ADDRESS = '0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9';

let verify;
async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);
  const verify = Verify(networkName);


  /// LTNT

  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.deploy(REGULAR_ADDRESS, ITALIC_ADDRESS);
  await _ltnt.deployed();
  console.log("LTNT deployed to:", _ltnt.address.green.bold);
  verify.add(_ltnt.address, [REGULAR_ADDRESS, ITALIC_ADDRESS]);

  const _ltnt_meta = await _ltnt.getMetaContract();
  console.log("LTNT_Meta deployed to:", _ltnt_meta.green.bold);
  verify.add(_ltnt_meta, [REGULAR_ADDRESS, ITALIC_ADDRESS]);

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
