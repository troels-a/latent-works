const hre = require("hardhat");
const networkName = hre.network.name;
const Verify = require('../verify.js');
require("colors");

async function main() {

  if(networkName !== 'rinkeby'){
    console.log(`NOT RINKEBY! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO RINKEBY'.bgGreen);

  const verify = Verify(networkName);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.attach('0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf');
  await _xmrl.deployed();
  verify.add(_xmrl.address);

  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.attach('0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9');
  await _xmil.deployed();
  verify.add(_xmil.address);

  console.log("Regular deployed to:", _xmrl.address.green.bold);
  console.log("Italic deployed to:", _xmil.address.green.bold);
  console.log(verify.command);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
