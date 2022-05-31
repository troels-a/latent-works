const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

const NETWORK = 'rinkeby';
const ADDRESS_77X7 = '0x81e4002C4F96B901fD97f8c5D9128020568d4EC5';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.attach('0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf');
  await _xmrl.deployed();
  
  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.attach('0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9');
  await _xmil.deployed();

  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.attach('0x6f2Ff40F793776Aa559644F52e58D83E21871EC3');
  await _ltnt.deployed();
  console.log("LTNT deployed to:", _ltnt.address.green.bold);

  const _ltnt_meta = await _ltnt.getMetaContract();
  console.log("LTNT_Meta deployed to:", _ltnt_meta.green.bold);

  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach(ADDRESS_77X7);
  await _77x7.deployed();

  const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
  _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.deploy(_77x7.address, _ltnt.address);
  await _77x7_ltnt_issuer.deployed();
  await _ltnt.addIssuer(_77x7_ltnt_issuer.address);
  console.log("77x7 issuer deployed to:", _77x7_ltnt_issuer.address.green.bold);

  const LW00x0 = await hre.ethers.getContractFactory("LW00x0");
  _00x0 = await LW00x0.deploy(_77x7.address, _77x7_ltnt_issuer.address, _ltnt.address);
  await _00x0.deployed();
  console.log("00x0 deployed to:", _00x0.address.green.bold);
  
  await _77x7_ltnt_issuer.setCaller(_00x0.address);
  await _ltnt.addIssuer(_00x0.address);

  const _00x0_meta_address = await _00x0._00x0_meta();
  console.log("00x0_Meta deployed to:", _00x0_meta_address.green.bold);

  console.log('Done');
//   [deployer] = await hre.ethers.getSigners();
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
