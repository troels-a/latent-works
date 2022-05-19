const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

async function main() {

  if(networkName !== 'localhost'){
    console.log(`NOT LOCALHOST! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO LOCALHOST'.bgGreen);

  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach('0xEF7c89F051ac48885b240eb53934B04fcF3339ab');
  await _77x7.deployed();

  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.deploy();
  await _ltnt.deployed();

  const LW00x0 = await hre.ethers.getContractFactory("LW00x0");
  _00x0 = await LW00x0.deploy(_ltnt.address);
  await _00x0.deployed();

  _ltnt.addIssuer(_00x0.address);

  console.log("00x0 deployed to:", _00x0.address.green.bold);
  console.log("LTNT deployed to:", _ltnt.address.green.bold);
  
  [owner, user1, user2, user3] = await hre.ethers.getSigners();

  await _77x7.connect(owner).safeBatchTransferFrom(owner.address, user1.address, [1, 3, 5, 6, 54, 56, 63], [1,1,1,1,1,1,1], []);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
