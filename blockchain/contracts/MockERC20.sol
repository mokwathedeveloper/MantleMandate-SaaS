// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice Minimal mintable ERC20 used to seed the MockSwapPool testnet AMM.
 *         Testnet-only — represents a mock asset (e.g. USD or ETH) so the
 *         AI agent can perform real on-chain swaps without mainnet funds.
 *
 * Deployed on Mantle Sepolia Testnet (chainId 5003).
 */
contract MockERC20 is ERC20 {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
