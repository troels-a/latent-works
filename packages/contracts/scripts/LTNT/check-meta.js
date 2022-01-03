const hre = require("hardhat");
const networkName = hre.network.name;
require("colors");

const NETWORK = 'rinkeby';
const ADDRESS_LTNT_META = '0xb9da4cc90d5b0e12c7cc683c995412e333208150';

async function main() {

  if(networkName !== NETWORK){
    console.log(`Not ${NETWORK}! ${networkName} detected`.toUpperCase().bgRed)
    throw '';
  }

  console.log(`Checking on ${networkName}`.bgGreen);

  const LTNT_Meta = await hre.ethers.getContractFactory("LTNT_Meta");
  ltnt_meta = LTNT_Meta.attach(ADDRESS_LTNT_META);
  await ltnt_meta.deployed();

  console.log(await ltnt_meta.getJSON(1, false))
  const tx = await ltnt_meta.getImage(100, false);
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
