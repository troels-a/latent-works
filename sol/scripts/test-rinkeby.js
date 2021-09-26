const hre = require("hardhat");

async function main() {

    const LatentWorks = await hre.ethers.getContractFactory("LatentWorks_77x7");
    const contract = await LatentWorks.attach(process.env.RINKEBY_CONTRACT);
    const av = await contract.getAvailable();

    const max = 30;

    let i = 0
    while(i < max){
        console.log('- minting')
        await contract.mint({
            value: ethers.utils.parseEther("0.07"),
        });
        
        i++;

        if(i == max){
            console.log('*** withdrawing ***')
            await contract.withdrawAll({
                value: ethers.utils.parseEther("0"),
            });    
        }
    }

    console.log('done');

    return;
    
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
