require("dotenv").config({path: '.env'});
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");

const accounts = require('./hhaccounts.js');
accounts[0] = {privateKey: process.env.DEPLOYER_KEY, balance: '10000000000000000000000'};
// accounts[01] = {privateKey: process.env.PRIVATE_KEY2, balance: '10000000000000000000000'};

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
  
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  gasReporter: {
    currency: 'ETH',
    gasPrice: 30,
    coinmarketcap: '430b4c0c-3705-426c-9056-92196dca927a'
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
      details: {
        yul: false,
      },
    },
  },
  paths: {
    sources: "./sol",
  },
  networks: {
    hardhat: {
      forking: {
        blockNumber: 14448993,
        url: process.env.MAINNET_FORK_URL,
      },
      accounts: accounts
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.DEPLOYER_KEY],
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.DEPLOYER_KEY],
    },
    localhost: {
      url: process.env.LOCALHOST_RPC_URL
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    except: ['@openzeppelin'],
    flat: true
  }  
};

