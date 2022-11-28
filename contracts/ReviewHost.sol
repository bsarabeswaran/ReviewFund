// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract ReviewHost {
    uint256 sing = 10**18;
    uint256 cost = 10**15;

    struct Project {
        address creator;
        bytes32 name;
        uint256 weights;
        uint256 votes;
        uint256 score;
        uint256 etherRewards;
        bool created;
    }

    mapping(bytes32 => Project) projects;

    mapping(uint256 => bytes32) queue;
    uint256 first = 1;
    uint256 last = 0;
    uint256 q_size;

    constructor() {
        console.log("Starting Review Host...");
    }

    function enqueue (bytes32 data) internal {
        last += 1;
        queue[last] = data;
        q_size += 1;
    }

    function dequeue() internal {
        require(last >= first);  // non-empty queue

        delete queue[first];
        first += 1;
        q_size -= 1;
    }

    // might want to add eth requirement to add a project...
    function addProject(bytes32 project_name) public returns (bool){
        if(projects[project_name].created == true) {
            return false;
        }

        projects[project_name].creator = msg.sender;
        projects[project_name].name = project_name;
        projects[project_name].weights = 0;
        projects[project_name].votes = 0;
        projects[project_name].score = 0;
        projects[project_name].etherRewards = 0;
        projects[project_name].created = true;

        if(q_size < 50) {
            enqueue(project_name);
        } else {
            dequeue();
            enqueue(project_name);
        }
        
        return true;
    }

    function addScore(bytes32 project_name, uint256 score, uint256 amount) payable public returns (uint256 newScore) {
        // TODO: Take in a project name, score, and required eth amount
        require(msg.value == amount);
        require(msg.value == cost);
        require(projects[project_name].created == true);
        require(score >= 0 && score <= 10);
        // TODO: add the user score to the overall score, recalculate
        projects[project_name].weights += score;
        projects[project_name].votes += 1;
        // TODO: take the eth amount into this smart contract
        // TODO: add that eth amount to the counter in the project's struct
        projects[project_name].score = (projects[project_name].weights / projects[project_name].votes);
        projects[project_name].etherRewards += msg.value;
        // TODO: return this recalculation
        return projects[project_name].score;
    }

    function getProjects() public view returns (bytes32[] memory visibles) {
        bytes32[] memory visible_projs = new bytes32[](q_size);
        for(uint i = 0; i < q_size; i += 1) {
            visible_projs[i] = queue[first + i];
        }
        return visible_projs;
    }

    function getScore(bytes32 name) public view returns(uint256 score) {
        require(projects[name].created == true);

        return projects[name].score;
    }

    function getCreator(bytes32 name) public view returns(address creator) {
        require(projects[name].created == true);

        return projects[name].creator;
    }

    function getFundingRaised(bytes32 name) public view returns(uint256 amount) {
        require(projects[name].created == true);

        return projects[name].etherRewards;
    }

    function extractEth(bytes32 name) public returns(uint256 etherReturned) {
        // TODO: check if the address owns the project
        require(projects[name].created == true);
        require(projects[name].creator == msg.sender);
        // TODO: return a portion of the funds back to the owner (using a safe function)
        uint256 returned = 17 * projects[name].etherRewards / 20;
        //payable(msg.sender).transfer(returned);
        //(bool succ, ) = (msg.sender).call{value: returned}("");
        (bool success, ) = (msg.sender).call{value: returned}("");
        require(success, "Failed to Send");
        // TODO: decrease etherRewards by that amount for the project (or to 0 maybe?)
        projects[name].etherRewards = 0;
        // TODO: return how much ether they got back (should NOT be equal to etherRewards)
        console.log("Returning to owner: ", returned);
        return returned;
    }
}