const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");
const Verify = require('../verify.js');

const NETWORK = 'mainnet';
const ADDRESS_77X7 = '0xEF7c89F051ac48885b240eb53934B04fcF3339ab';
const ADDRESS_77X7_ISSUER = '0x56965521CA0fd26d1A6733a87848C00bcd56a0Ac';
const ADDRESS_LTNT = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Deploying to ${networkName}`.bgGreen);
  const verify = Verify(networkName);


  /// ATTACH 77x7
  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach(ADDRESS_77X7);
  await _77x7.deployed();


  /// ATTACH LTNT
  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.attach(ADDRESS_LTNT);
  await _ltnt.deployed();


  /// LW77x7
  const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
  _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.attach(ADDRESS_77X7_ISSUER);
  await _77x7_ltnt_issuer.deployed();


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
