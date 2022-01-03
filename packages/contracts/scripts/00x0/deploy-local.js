const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

async function main() {

  if(networkName !== 'localhost'){
    console.log(`NOT LOCALHOST! ${networkName.toUpperCase()} DETECTED`.bgRed)
    throw '';
  }

  console.log('DEPLOYING TO LOCALHOST'.bgGreen);

  const XanhMonoRegularLatin = await hre.ethers.getContractFactory("XanhMonoRegularLatin");
  _xmrl = await XanhMonoRegularLatin.deploy();
  await _xmrl.deployed();
  const XanhMonoItalicLatin = await hre.ethers.getContractFactory("XanhMonoItalicLatin");
  _xmil = await XanhMonoItalicLatin.deploy();
  await _xmil.deployed();

  console.log('FONTS')
  console.log(_xmrl.address)
  console.log(_xmil.address)


  const LTNT = await hre.ethers.getContractFactory("LTNT");
  _ltnt = await LTNT.deploy(_xmrl.address, _xmil.address);
  await _ltnt.deployed();

  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach('0xEF7c89F051ac48885b240eb53934B04fcF3339ab');
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

  const LW00x0_Meta = await hre.ethers.getContractFactory("LW00x0_Meta");
  _00x0_meta = LW00x0_Meta.attach(await _00x0._00x0_meta());
  await _00x0_meta.deployed();

  console.log("00x0 deployed to:", _00x0.address.green.bold);
  console.log("LTNT deployed to:", _ltnt.address.green.bold);
  
  [deployer, user1, user2, user3] = await hre.ethers.getSigners();
  
//   const _77x7HolderAddress = '0x3827014F2236519f1101Ae2E136985E0e603Be79';
//   await hre.network.provider.request({
//       method: "hardhat_impersonateAccount",
//       params: [_77x7HolderAddress],
//   });

//   await network.provider.send("hardhat_setBalance", [
//       _77x7HolderAddress,
//       hre.ethers.utils.parseEther("1000").toHexString(),
//   ]);

//   _77x7holder = await ethers.getSigner(_77x7HolderAddress)

//   await _77x7.connect(_77x7holder).safeBatchTransferFrom(_77x7holder.address, _00x0.address, [1, 3], [1,1], [], {gasLimit: 300000});
//   await _77x7.connect(_77x7holder).safeBatchTransferFrom(_77x7holder.address, _00x0.address, [5, 6], [1,1], [], {gasLimit: 300000});
//   await _77x7.connect(_77x7holder).safeBatchTransferFrom(_77x7holder.address, _00x0.address, [54, 56, 63], [1,1,1], [], {gasLimit: 300000});

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
