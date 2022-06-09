const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

const NETWORK = 'localhost';
const ADDRESS_LTNT = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';
const ADDRESS_REGULAR = '0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf';
const ADDRESS_ITALIC = '0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);
  

  /// LTNT
  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.attach(ADDRESS_LTNT);
  await _ltnt.deployed();
  console.log("LTNT deployed to:", _ltnt.address.green.bold);


  /// BE
  const LWBrokenEnglish = await hre.ethers.getContractFactory("LWBrokenEnglish");
  _be = await LWBrokenEnglish.deploy(ADDRESS_LTNT, ADDRESS_REGULAR, ADDRESS_ITALIC);
  await _be.deployed();
  await _ltnt.addIssuer(_be.address)
  console.log("Broken English deployed to:", _be.address.green.bold);

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
