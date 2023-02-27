// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract TestToken is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721BurnableUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;
    mapping(address => bool) allowed;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
        allowed[msg.sender] = true;
    }

    function initialize() public initializer {
        __ERC721_init("TestToken", "TTK");
        __ERC721URIStorage_init();
        __ERC721Burnable_init();
        __Ownable_init();
    }

    function mint(address to, string memory uri) public onlyOwner onlyAdmin {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function disableAdmin(address adminToDisable) public onlyOwner {
        require(
            allowed[adminToDisable] == true,
            "This address does not exist in the allowed list"
        );
        allowed[adminToDisable] = false;
    }

    function addAdmin(address adminToAdd) public onlyOwner {
        require(
            allowed[adminToAdd] == false,
            "This address is already allowed to mint"
        );
        allowed[adminToAdd] = true;
    }

    modifier onlyAdmin() {
        require(
            allowed[msg.sender] == true,
            "Ownership Assertion: Caller of the function is not the owner."
        );
        _;
    }
}
