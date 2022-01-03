const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");
const Verify = require('../verify.js');

const NETWORK = 'rinkeby';
const ADDRESS_77X7 = '0x81e4002C4F96B901fD97f8c5D9128020568d4EC5';
// const ADDRESS_77X7_ISSUER = '0xC4b219Ce2510c26f0527Ed6EA058409a9118F107';
// const ADDRESS_LTNT = '0xeDbF3134217D6223EEF411EF796635830a8ad8D5';
const REGULAR_ADDRESS = '0x5f5319b6A8bF5c26b6021CEB5f26d1f6fBc33FAf';
const ITALIC_ADDRESS = '0x50C1803A4FF4Ed29568f8c123c2583a688BAF5A9';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);
  const verify = Verify(networkName);

  

  /// ATTACH
  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach(ADDRESS_77X7);
  await _77x7.deployed();


  /// LTNT
  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.deploy(REGULAR_ADDRESS, ITALIC_ADDRESS);
  await _ltnt.deployed();
  console.log("LTNT deployed to:", _ltnt.address.green.bold);
  verify.add(_ltnt.address, [REGULAR_ADDRESS, ITALIC_ADDRESS]);

  const _ltnt_meta = await _ltnt.getMetaContract();
  console.log("LTNT_Meta deployed to:", _ltnt_meta.green.bold);
  verify.add(_ltnt_meta, [_ltnt.address, REGULAR_ADDRESS, ITALIC_ADDRESS]);


  /// LW77x7
  const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
  _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.deploy(_77x7.address, _ltnt.address);
  await _77x7_ltnt_issuer.deployed();
  
  await _ltnt.addIssuer(_77x7_ltnt_issuer.address);

  console.log("77x7 issuer deployed to:", _77x7_ltnt_issuer.address.green.bold);
  verify.add(_77x7_ltnt_issuer.address, [_77x7.address, _ltnt.address]);


  /// LW00x0
  const LW00x0 = await hre.ethers.getContractFactory("LW00x0");
  _00x0 = await LW00x0.deploy(_77x7.address, _77x7_ltnt_issuer.address, _ltnt.address);
  await _00x0.deployed();
  console.log("00x0 deployed to:", _00x0.address.green.bold);
  verify.add(_00x0.address, [_77x7.address, _77x7_ltnt_issuer.address, _ltnt.address]);

  await _77x7_ltnt_issuer.setCaller(_00x0.address);
  await _ltnt.addIssuer(_00x0.address);

  const _00x0_meta_address = await _00x0._00x0_meta();
  console.log("00x0_Meta deployed to:", _00x0_meta_address.green.bold);
  verify.add(_00x0_meta_address, [_00x0.address, _77x7.address]);

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
