const { task } = require("hardhat/config");
const { types } = require("hardhat/config")
const fs = require('fs');
const path = require('path').dirname(__dirname);


function formatFromFilename(filename) {

    const suffix = filename.split('.')[1].toLowerCase();

    if(suffix === 'gif')
        return 'gif';
    if(suffix === 'jpg' || suffix === 'jpeg')
        return 'jpeg';

    throw new Error(`Unknown file extension: ${suffix}`);

}


require("colors");

task("transfer-eth", "Transfer ETH to an address", async (args, hre) => {
    const { ethers } = hre;
    const [deployer] = await ethers.getSigners();
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





/**
 * 
 * MEMPOOLS
 */

// DEPLOY

task("mempools:deploy", "Deploy mempool contract", async (taskArgs, hre) => {

    await hre.run('compile');
    console.log(`Deploying mempools to network ${hre.network.name}`);

    const address = hre.config.latent[hre.network.name]['ltnt'];
    if(!address)
        throw new Error('No LTNT address found in config');

    const LWMempools = await hre.ethers.getContractFactory("LWMempools");
    const mempools = await LWMempools.deploy(address);
    await mempools.deployed();

    console.log("mempools deployed to:", mempools.address.green.bold);

});

task("mempools:add-bank", "Add bank to mempools contract", async ({bankpath}, hre) => {

    const base = [];
    const dirparts = bankpath.split('/');
    const folder = dirparts[dirparts.length-1];
    const name = folder.split('_')[0];
    const filter = folder.split('_')[1] || 'none';
    const files = await fs.readdirSync(bankpath);

    const parts = await Promise.all(files.filter(file => file.match(/.(jpeg|jpg|gif)$/i)).map(async file => {
        const filepath = `${bankpath}/${file}`;
        const file_buffer = await fs.readFileSync(filepath);
        const format = formatFromFilename(file);
        const part = 'data:image/'+format+';base64,'+file_buffer.toString('base64');
        return part;
    }))

    const mempools_address = hre.config.latent[hre.network.name]['mempools'];
    if(!mempools_address)
        throw new Error('No mempools address found in config');
  
    const mempools = await hre.ethers.getContractAt("LWMempools", process.env.ADDRESS_MEMPOOLS);
    const tx = await mempools.addBank(name, parts, filter);

    console.log(`Added ${name} bank to mempools`);
})
.addParam("bankpath", "Path to bank folder", undefined, types.string);;  


task("mempools:mint-bank", "Mint all tokens", async ({bankindex}, hre) => {

    const mempools_address = hre.config.latent[hre.network.name]['mempools'];
    if(!mempools_address)
        throw new Error('No mempools address found in config');

    const LWMempools = await hre.ethers.getContractAt("LWMempools", mempools_address);

    const bank = await LWMempools.getBank(bankindex);
    const price = await LWMempools.PRICE();

    let poolindex = 0;
    for(pool_id of bank._pools){
        if(pool_id == 0){
            const tx = await LWMempools.mint(bankindex, poolindex, {value: price});
            await tx.wait();
        }
        poolindex++;
    }
    
    console.log(`Minted available tokens of bank "${bank._name}" to ${address}`.green);

})
.addParam("bankindex", "Index of bank to mint", undefined, types.string);;


/**
 * 
 * LTNT
 */

task("ltnt:transfer", "Transfer LTNT to an address", async ({from, to, ids}, hre) => {

    const { ethers } = hre;
    const sender = await hre.ethers.getImpersonatedSigner(from);
    ids = ids.split(',').map(id => parseInt(id));
    const ltnt_address = hre.config.latent[hre.network.name]['ltnt'];
    if(!ltnt_address)
        throw new Error('No LTNT address found in config');

    if(parseInt(to) === 0)
        to = '0x0000000000000000000000000000000000000000';

    const contract = await hre.ethers.getContractAt("LTNT", ltnt_address);
    for(id of ids){
        const tx = await contract.connect(sender).transferFrom(from, to, id);
        await tx.wait();
    }
    console.log(`Transferred ${ids.length} LTNT to ${to}`.green);    

})
.addParam("from", "The address to send LTNT from", undefined, types.string)
.addParam("to", "The address to send LTNT to", undefined, types.string)
.addParam("ids", "The ids of the LTNT to send", undefined, types.string);

task("ltnt:add-issuer", "Add issuer to contract", async ({address}, hre) => {

    const ltnt_address = hre.config.latent[hre.network.name]['ltnt'];
    if(!ltnt_address)
        throw new Error('No LTNT address found in config');

    const LTNT = await hre.ethers.getContractFactory("LTNT");
    const ltnt = await LTNT.attach(process.env.ADDRESS_LTNT);
    await ltnt.deployed();

    await ltnt.addIssuer(address);

    const issuer = await ltnt.getIssuers().then(res => res[res.length-1]);

    console.log(`Issuer ${issuer} added to LTNT contract on network "${hre.network.name}"`);
    
})
.addParam('address', types.Address, "Address of issuer")