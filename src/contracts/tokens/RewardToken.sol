// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title RewardToken
 * @dev ERC20 Reward Token for yield farming rewards
 */
contract RewardToken is ERC20 {
    constructor() ERC20("Reward Token", "RWRD") {
        // Mint 10,000,000 tokens to deployer (with 18 decimals)
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }
}