//SPDX-License-Identifier: MIT OR Apache2.0
pragma solidity ^0.8.2;

import "@rari-capital/solmate/src/tokens/ERC1155.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MiracleToken is ERC1155, Ownable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address private marketplaceAddress;

    constructor(address deployedMarketplaceAddress) ERC1155() {
        marketplaceAddress = deployedMarketplaceAddress;
    }

    function uri(uint256 id) public view override returns (string memory){
        string memory data;
        return data;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function createToken() public returns(uint256){
        _tokenIds.increment();
        uint newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId, 1, "");
        // _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(marketplaceAddress, true);
        // approve(marketplaceAddress, newItemId);
        return newItemId;
    }
}