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
  const ooxo = await OOxO.deploy();
  await ooxo.deployed();

  const LatentWorks_77x7 = await hre.ethers.getContractFactory("LatentWorks_77x7");
  _77x7 = LatentWorks_77x7.attach(process.env.ADDRESS_77X7);

  console.log("00x0 deployed to:", ooxo.address.green.bold);
  
  [owner, user1, user2, user3] = await hre.ethers.getSigners();

  await _77x7.connect(owner).safeBatchTransferFrom(owner.address, user1.address, [1, 3, 5, 6, 54, 56, 63], [1,1,1,1,1,1,1], []);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
