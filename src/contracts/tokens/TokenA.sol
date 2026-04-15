// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TokenA
 * @dev ERC20 Token A for the liquidity pool (e.g., ETH-like token)
 */
contract TokenA is ERC20 {
    constructor() ERC20("Token A", "TKNA") {
        // Mint 1,000,000 tokens to deployer (with 18 decimals)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}