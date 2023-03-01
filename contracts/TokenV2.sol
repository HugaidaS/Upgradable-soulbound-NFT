// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./TokenV1.sol";

contract TestTokenV2 is TestTokenV1 {
    // Add new functionality
    function sayHi2() public pure returns (string memory) {
        return "Hi from V2";
    }

    // override existing functionality
    function sayHi() public pure override returns (string memory) {
        return "Hi from V2";
    }

    function _burn(uint256 tokenId) internal override {
        require(
            ownerOf(tokenId) == msg.sender,
            "Restriction: Only owner can burn the token"
        );
        super._burn(tokenId);
    }

    modifier onlyAdmin() override {
        require(
            allowed_to_mint[msg.sender] == true,
            "Restriction: Caller of the function is not in the allowed list."
        );
        _;
    }
}
