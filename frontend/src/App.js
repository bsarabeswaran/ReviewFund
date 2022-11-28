import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/ReviewHost.json";
import 'bootstrap/dist/css/bootstrap.min.css';
var Web3 = require('web3');

//const contractAddress = "0x44625009759Eec6049F9969816AB0420d321e1F7";
//const contractAddress = "0x43AC82aDD40Ae609EcE5e604C75c9Dd72e6aEEBC";
//const contractAddress = "0x853a7Dc66e0009124103503F32Fb11b7Ffd262f9";
const contractAddress = "0x6d443c55e567eE21306c5454E3cb42BE498a7e08";
const contractABI = abi.abi;

const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    if (!ethereum) {
      console.error("Please have a valid MetaMask account");
      return null;
    }

    console.log("Captured Ethereum object: ", ethereum);
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Using account: ", account);
      return account;
    } else {
      console.log(accounts);
      console.error("No account found");
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getProjects = async () => {
  try {
    const ethereum = getEthereumObject();

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const reviewFundContract = new ethers.Contract(contractAddress, contractABI, signer);

      let top50 = await reviewFundContract.getProjects();
      let top50_w_score_and_input = [];
      for (let i = 0; i < top50.length; ++i) {
        const score = await reviewFundContract.getScore(top50[i]);
        const movieObjDiv = (
          <div className="waveButton shadow p-3 mb-5 bg-white rounded hoverer" key={i}>
            <b>{ethers.utils.parseBytes32String(top50[i])}</b>
            <br></br>
            {await reviewFundContract.getCreator(top50[i])}
            <br></br>
            <div className="adder">
              Score: <b>{score.toString()}</b>
            </div>
            <br></br>
            Add a score:
            <ScoreAdderComp name={ethers.utils.parseBytes32String(top50[i])} className="adder"></ScoreAdderComp>
            <br></br>
            <ExtractEthComp name={ethers.utils.parseBytes32String(top50[i])} className="adder"></ExtractEthComp>
          </div>
        );
        top50_w_score_and_input.push(movieObjDiv);
      }
      return top50_w_score_and_input;
    }
  } catch (error) {
    console.log(error);
    return Array(0);
  }
};

const addProject = async (textEntered) => {
  try {
    const ethereum = getEthereumObject();

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const reviewFundContract = new ethers.Contract(contractAddress, contractABI, signer);

      let top50 = await reviewFundContract.addProject(Web3.utils.padRight(Web3.utils.asciiToHex(textEntered), 64));
      console.log(top50);
    }
  } catch (error) {
    console.log(error);
  }
};

const addScore = async (name, score) => {
  try {
    const ethereum = getEthereumObject();

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const reviewFundContract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log(ethers.utils.parseEther("0.001").toString());
      await reviewFundContract.addScore(Web3.utils.padRight(Web3.utils.asciiToHex(name['name']), 64), score, ethers.utils.parseEther("0.001"), {
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 5000000,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const ScoreAdderComp = (name) => {
  const [currScoreSelect, setCurrScoreSelect] = useState("5");

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(currScoreSelect);
    await addScore(name, currScoreSelect);
  };

  return (
    <div className="adder">
      <form onSubmit={handleSubmit}>
        <select
          value={currScoreSelect}
          onChange={e => setCurrScoreSelect(e.target.value)}
          className="sel-spot btn btn-outline-primary"
        >
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

const extractEth = async (name) => {
  try {
    const ethereum = getEthereumObject();

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const reviewFundContract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log(name)

      // --------------- LOG AMOUNT -----------------
      console.log((await reviewFundContract.getFundingRaised(Web3.utils.padRight(Web3.utils.asciiToHex(name['name']), 64))).toString());
      // --------------- LOG AMOUNT -----------------

      
      // --------------- EXTRACTION -----------------
      await reviewFundContract.extractEth(Web3.utils.padRight(Web3.utils.asciiToHex(name['name']), 64));
      // --------------- EXTRACTION -----------------
    }
  } catch (error) {
    console.log(error);
  }
};

const ExtractEthComp = (name) => {

  const handleSubmit = async (event) => {
    event.preventDefault();
    await extractEth(name);
  };

  return (
    <div className="adder">
      <form onSubmit={handleSubmit}>
      <button
          type="submit"
          className="btn btn-light adder"
        >
          Extract Funds
        </button>
        </form>
    </div>
  );
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allProjects, setAllProjects] = useState(Array(0));
  const [textEntered, setTextEntered] = useState("");

  // --------------- WALLETCONNECT ------------------
  const walletConnect = async () => {
    try {
      const acc = await findMetaMaskAccount();
      setCurrentAccount(acc);
    } catch (error) {
      console.error(error);
    }
  };

  let walletConnectButton = null;
  if (!currentAccount) {
    walletConnectButton = (<button className="waveButton" onClick={walletConnect}>Connect Wallet</button>)
  }
  // --------------- WALLETCONNECT ------------------


  // --------------- QUERYPROJECTS ------------------
  const queryProjects = async () => {
    try {
      const toRet = await getProjects();
      console.log(toRet);
      setAllProjects(toRet);
    } catch (error) {
      console.error(error);
    }
  };
  // --------------- QUERYPROJECTS ------------------

  // --------------- ADDPROJECT ------------------

  const handleSubmitProj = async (event) => {
    event.preventDefault();
    try {
      await addProject(textEntered);
      setTextEntered("");
    } catch (error) {
      console.error(error);
    }
  };

  let addProjectsField = (
    <div className="centerer">
      Add a Project:
      <form className="spacer" onSubmit={handleSubmitProj}>
        <input type="text" value={textEntered} onChange={e => { setTextEntered(e.target.value) }} />
      </form>
    </div>
  );

  // --------------- ADDPROJECT ------------------

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          ReviewFund - Review your favorite projects and help fund them!
        </div>

        <div className="bio">
          Connect your Ethereum wallet, add projects, and review projects!
        </div>
        {walletConnectButton}
      
        {currentAccount && (addProjectsField)}
        {currentAccount && (
          <button className="waveButton" onClick={queryProjects}>
            Update to get the newest projects
          </button>
        )}
        <div className="grid-grid-container">
          <br></br>
          <div className="grid-container">
            {allProjects}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;