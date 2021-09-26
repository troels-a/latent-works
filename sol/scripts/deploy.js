const hre = require("hardhat");

async function main() {
  const LatentWorks = await hre.ethers.getContractFactory("LatentWorks_77x7");
  const contract = await LatentWorks.deploy();
  await contract.deployed();
  console.log("LatentWorks 77x7 deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
