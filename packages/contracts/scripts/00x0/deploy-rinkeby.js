const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

const NETWORK = 'rinkeby';
const ADDRESS_77X7 = '0x2f97FFE0A5EfF45FD9A1e6CDD81768bE2BDb3A8E';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.deploy('0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf');
  await _xmrl.deployed();
  
  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.attach('0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9');
  await _xmil.deployed();

  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.deploy(_xmrl.address, _xmil.address);
  await _ltnt.deployed();

  const _ltnt_meta = await _ltnt._ltnt_meta();

  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach(ADDRESS_77X7);
  await _77x7.deployed();

  const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
  _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.deploy(_77x7.address, _ltnt.address);
  await _77x7_ltnt_issuer.deployed();
  await _ltnt.addIssuer(_77x7_ltnt_issuer.address);

  const LW00x0 = await hre.ethers.getContractFactory("LW00x0");
  _00x0 = await LW00x0.deploy(_77x7.address, _77x7_ltnt_issuer.address, _ltnt.address);
  await _00x0.deployed();
  await _77x7_ltnt_issuer.setCaller(_00x0.address);
  await _ltnt.addIssuer(_00x0.address);

  const _00x0_meta_address = await _00x0._00x0_meta();

  console.log("00x0 deployed to:", _00x0.address.green.bold);
  console.log("00x0_Meta deployed to:", _00x0_meta_address.green.bold);
  console.log("LTNT deployed to:", _ltnt.address.green.bold);
  console.log("LTNT_Meta deployed to:", _ltnt.address.green.bold);
  console.log("77x7 issuer deployed to:", _77x7_ltnt_issuer.address.green.bold);
  
//   [deployer] = await hre.ethers.getSigners();
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
