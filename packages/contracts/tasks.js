const { task } = require("hardhat/config");
const { types } = require("hardhat/config")
const fs = require('fs');
const path = require('path').dirname(__dirname);

require("colors");

task("transfer-eth", "Transfer ETH to an address", async (args, hre) => {
    const { ethers } = hre;
    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();
    const { address, amount } = args;
    const tx = await deployer.sendTransaction({
        to: address,
        value: ethers.utils.parseEther(amount),
    });
    await tx.wait();
    console.log(`Sent ${amount} ETH to ${address}`.green);
})
.addParam("address", "The address to send ETH to", undefined, types.string)
.addParam("amount", "The amount of ETH to send", undefined, types.string);

task("mempools:deploy", "Deploy mempool contract", async (taskArgs, hre) => {

  await hre.run('compile');
  console.log(`Deploying mempools to network ${hre.network.name}`);

  const LWMempools = await hre.ethers.getContractFactory("LWMempools");
  const mempools = await LWMempools.deploy(process.env.ADDRESS_LTNT);
  await mempools.deployed();

  console.log("mempools deployed to:", mempools.address.green.bold);

});

task("mempools:add-bank", "Add bank to mempools contract", async ({bankpath}, hre) => {

    const base = [];
    const dirparts = bankpath.split('/');
    const folder = dirparts[dirparts.length-1];
    console.log(folder)
    const name = folder.split('_')[0];
    const filter = folder.split('_')[1] || 'none';
    const files = await fs.readdirSync(bankpath);

    const parts = await Promise.all(files.filter(file => file.match(/.jpg$/i)).map(async file => {
        const filepath = `${bankpath}/${file}`;
        const file_buffer = await fs.readFileSync(filepath);
        const part = 'data:image/jpeg;base64,'+file_buffer.toString('base64');
        return part;
    }))
  
    const mempools = await hre.ethers.getContractAt("LWMempools", process.env.ADDRESS_MEMPOOLS);
    const tx = await mempools.addBank(name, parts, filter);

    console.log(`Added ${name} bank to mempools`);
})
.addParam("bankpath", "Path to bank folder", undefined, types.string);;  


task("ltnt:add-issuer", "Add issuer to contract", async ({address}, hre) => {

    const LTNT = await hre.ethers.getContractFactory("LTNT");
    const ltnt = await LTNT.attach(process.env.ADDRESS_LTNT);
    await ltnt.deployed();

    await ltnt.addIssuer(address);

    const issuer = await ltnt.getIssuers().then(res => res[res.length-1]);

    console.log(`Issuer ${issuer} added to contract`);
    
})
.addParam('address', types.Address, "Address of issuer")
