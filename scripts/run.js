const { BN } = require("bn.js");
var Web3 = require('web3');
//import { ethers } from "ethers";

const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const reviewHostFactory = await hre.ethers.getContractFactory("ReviewHost");
    const reviewHost = await reviewHostFactory.deploy();
    await reviewHost.deployed();
    
    console.log("Review Host deployed to: ", reviewHost.address);
    console.log("Review Host deployed by: ", owner.address);

    console.log(await reviewHost.getProjects());
    const spider_man = Web3.utils.padRight(Web3.utils.asciiToHex("Spider-Man (2002)"), 64);
    const first_ProjectAdd = await reviewHost.connect(randomPerson).addProject(spider_man);
    console.log(await first_ProjectAdd.wait());

    console.log(await reviewHost.getProjects());
    const score = "10";
    const cost = "1000000000000000";
    const second_ScoreAdd = await reviewHost.connect(owner).addScore(spider_man, score, cost, { value: cost });
    await second_ScoreAdd.wait();

    const third_scoreAdd = await reviewHost.connect(randomPerson).addScore(spider_man, "8", cost, { value: cost });
    await third_scoreAdd.wait();

    console.log(await reviewHost.getScore(spider_man));

    console.log(await reviewHost.getCreator(spider_man));
    console.log(hre.ethers.utils.formatEther(
        // getBalance returns wei amount, format to ETH amount
        await hre.ethers.provider.getBalance(randomPerson.address)
    ));
    //console.log(Web3.eth.getBalance(randomPerson.address));
    console.log(await reviewHost.connect(randomPerson).extractEth(spider_man));
    //console.log(Web3.eth.getBalance(randomPerson.address));
    console.log(hre.ethers.utils.formatEther(
        // getBalance returns wei amount, format to ETH amount
        await hre.ethers.provider.getBalance(randomPerson.address)
    ));
};

const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    } catch (error) {
        console.log(error);
        process.exit(1); // exit Node process while indicating 'Uncaught Fatal Exception' error
    }
};

runMain();