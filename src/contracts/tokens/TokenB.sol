// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TokenB
 * @dev ERC20 Token B for the liquidity pool (e.g., USDC-like token)
 */
contract TokenB is ERC20 {
    constructor() ERC20("Token B", "TKNB") {
        // Mint 1,000,000 tokens to deployer (with 18 decimals)
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }
}