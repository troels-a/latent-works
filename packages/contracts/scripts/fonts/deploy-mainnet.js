const hre = require("hardhat");
const networkName = hre.network.name;
const Verify = require('../verify.js');
require("colors");

async function main() {

  if(networkName !== 'mainnet'){
    console.log(`NOT MAINNET! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO MAINNET'.bgGreen);

  const verify = Verify(networkName);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.deploy();
  await _xmrl.deployed();
  verify.add(_xmrl.address);

  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.deploy();
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
