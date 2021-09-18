require("dotenv").config({path: '.env.local'});
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");

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
    sources: "./sol/contracts",
    tests: "./sol/test",
    cache: "./sol/cache",
    artifacts: "./sol/artifacts"
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.RINKEBY_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY],
    },
    localhost: {
      url: process.env.LOCALHOST_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  }
};

