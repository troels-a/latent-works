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

  console.log(`Minting on ${networkName}`.bgGreen);

  const LW77x7 = await hre.ethers.getContractFactory("LW77x7");
  _77x7 = LW77x7.attach(ADDRESS_77X7);
  await _77x7.deployed();
  let avail = await _77x7.getAvailable();
  avail = avail.toNumber();
  console.log(avail)
  let tx;
  let i = 0;

  while(i < avail){
            
        await _77x7.mint({value: hre.ethers.utils.parseEther('0.07')})
        i++;
        console.log('Minted '+i+'/'+avail)

        if(i % 11 == 0){
            console.log('Withdrawing...')
            await _77x7.withdrawAll();
        }

        // if(i == 77){
        //     i = 0;
        //     console.log(`Releasing edition`);
        //     _77x7.releaseEdition([], {gasLimit: 300000});
        // }

  }
  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
