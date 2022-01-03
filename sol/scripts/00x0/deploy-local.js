const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

async function main() {

  if(networkName !== 'localhost'){
    console.log(`NOT LOCALHOST! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO LOCALHOST'.bgGreen);

  const OOxO = await hre.ethers.getContractFactory("LatentWorks_00x0");
  const ooxo = await OOxO.deploy('0xEF7c89F051ac48885b240eb53934B04fcF3339ab');
  await ooxo.deployed();

  console.log("00x0 deployed to:", ooxo.address.green.bold);
  
  [owner, user1, user2, user3] = await hre.ethers.getSigners();

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
