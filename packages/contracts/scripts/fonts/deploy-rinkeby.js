const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

async function main() {

  if(networkName !== 'rinkeby'){
    console.log(`NOT RINKEBY! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO RINKEBY'.bgGreen);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.deploy();
  await _xmrl.deployed();
  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.deploy();
  await _xmil.deployed();

  console.log('FONTS')
  console.log(_xmrl.address)
  console.log(_xmil.address)

  console.log("Regular deployed to:", _xmrl.address.green.bold);
  console.log("Italic deployed to:", _xmil.address.green.bold);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
