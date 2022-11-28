const { BN } = require("bn.js");
var Web3 = require('web3');

const main = async () => {
    const [owner] = await hre.ethers.getSigners();
    console.log("Deploying Host with account: ", owner.address);
    
    const reviewHostFactory = await hre.ethers.getContractFactory("ReviewHost");
    const reviewHost = await reviewHostFactory.deploy();
    await reviewHost.deployed();

    console.log("Review Host deployed to: ", reviewHost.address);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
      } catch (error) {
        console.log(error);
        process.exit(1);
      }
};

runMain();