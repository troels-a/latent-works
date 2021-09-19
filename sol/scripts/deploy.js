const hre = require("hardhat");

async function main() {
  const LatentWorks = await hre.ethers.getContractFactory("LatentWorks");
  const contract = await LatentWorks.deploy();
  await contract.deployed();
  console.log("LatentWorks deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
