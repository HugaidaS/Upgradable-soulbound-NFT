// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract TestTokenV1 is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    ERC721BurnableUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    CountersUpgradeable.Counter private _tokenIdCounter;
    mapping(address => bool) allowed_to_mint;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("TestToken", "TTK");
        __ERC721URIStorage_init();
        __ERC721Burnable_init();
        __Ownable_init();
        allowed_to_mint[msg.sender] = true;
    }

    function mint(address to, string memory uri)
        public
        virtual
        onlyOwner
        onlyAdmin
    {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner of the token can burn it"
        );
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function disableAllowed(address addressToDisable) public onlyOwner {
        require(
            allowed_to_mint[addressToDisable] == true,
            "This address does not exist in the allowed list"
        );
        allowed_to_mint[addressToDisable] = false;
    }

    function addAllowed(address addressToAdd) public virtual onlyOwner {
        require(
            allowed_to_mint[addressToAdd] == false,
            "This address is already allowed to mint"
        );
        allowed_to_mint[addressToAdd] = true;
    }

    function _beforeTokenTransfer(address from, address to)
        internal
        pure
        virtual
    {
        require(
            from == address(0) || to == address(0),
            "This is a Soulbound token. It cannot be transferred. It can only be burned by the owner."
        );
    }

    function sayHi() public pure virtual returns (string memory) {
        return "Hi from V1";
    }

    modifier onlyAdmin() virtual {
        require(
            allowed_to_mint[msg.sender] == true,
            "Ownership Assertion: Caller of the function is not in the allowed list."
        );
        _;
    }
}
