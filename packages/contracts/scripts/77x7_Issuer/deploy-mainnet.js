const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");
const Verify = require('../verify.js');

const NETWORK = 'mainnet';
const ADDRESS_77X7 = '0xEF7c89F051ac48885b240eb53934B04fcF3339ab';
const ADDRESS_LTNT = '0x6f2Ff40F793776Aa559644F52e58D83E21871EC3';

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

  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = LTNT.attach(ADDRESS_LTNT);
  await _ltnt.deployed();


  /// LW77x7
  const LW77x7_LTNTIssuer = await hre.ethers.getContractFactory("LW77x7_LTNTIssuer");
  _77x7_ltnt_issuer = await LW77x7_LTNTIssuer.deploy(_77x7.address, _ltnt.address);
  await _77x7_ltnt_issuer.deployed();
  
  await _ltnt.addIssuer(_77x7_ltnt_issuer.address);

  console.log("77x7 issuer deployed to:", _77x7_ltnt_issuer.address.green.bold);
  verify.add(_77x7_ltnt_issuer.address, [_77x7.address, _ltnt.address]);


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
