//SPDX-License-Identifier: MIT OR Apache2.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@rari-capital/solmate/src/tokens/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract NFTMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    address payable marketOwner;
    uint256 listingPrice = 0.025 ether;

    constructor() {
        marketOwner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        uint256 tokenId;
        address nftContract;
        address payable owner;
        address lastSeller;
        address[] prevOwners;
        uint256 price;
        uint256 lastPrice;
        bool onSale;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    function createMarketItem(uint256 tokenId, address nftContract)
        public
        returns (uint256)
    {
        require(
            ERC1155(nftContract).balanceOf(msg.sender, tokenId)>=1,
            "Only owner can list new Items"
        );
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        address[] memory prevOwners;

        idToMarketItem[itemId] = MarketItem(
            itemId,
            tokenId,
            nftContract,
            payable(msg.sender),
            payable(address(0)),
            prevOwners,
            0,
            0,
            false
        );

        return itemId;
    }

    function listItemOnSale(
        uint256 itemId,
        address nftContract,
        uint256 price
    ) public payable {
        require(
            idToMarketItem[itemId].owner == msg.sender,
            "only owner can put this item on sale"
        );
        require(
            msg.value == listingPrice,
            "Amount doesn't meet listing fees requirements (.0025eth)"
        );

        // ERC1155(nftContract).safeTransferFrom(
        //     msg.sender,
        //     address(this),
        //     idToMarketItem[itemId].tokenId,
        //     1,
        //     ""
        // );
        marketOwner.transfer(msg.value);

        idToMarketItem[itemId].onSale = true;
        idToMarketItem[itemId].lastSeller = msg.sender;
        idToMarketItem[itemId].price = price;
    }

    function sellMarketItem(uint256 itemId, address nftContract)
        public
        payable
        nonReentrant
    {
        require(
            msg.value == idToMarketItem[itemId].price,
            "Amount must be equal to price"
        );
        require(
            msg.sender != idToMarketItem[itemId].owner,
            "Owner shouldn't buy their NFTs"
        );

        ERC1155(nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            idToMarketItem[itemId].tokenId,
            1,
            ""
        );
        idToMarketItem[itemId].owner.transfer(msg.value);

        idToMarketItem[itemId].prevOwners.push(idToMarketItem[itemId].owner);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].lastPrice = idToMarketItem[itemId].price;
        idToMarketItem[itemId].price = 0;
        idToMarketItem[itemId].onSale = false;
    }

    function fetchAllItemsOnSale() public view returns (MarketItem[] memory) {
        uint256 itemsCount = _itemIds.current();
        uint256 onSaleItems = 0;

        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].onSale == true) {
                onSaleItems++;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](onSaleItems);
        uint256 index = 0;

        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].onSale == true) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                marketItems[index] = currentItem;
                index++;
            }
        }

        return marketItems;
    }

    function fetchAllItemsOfOwner() public view returns (MarketItem[] memory) {
        uint256 itemsCount = _itemIds.current();
        uint256 ownedItems = 0;

        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                ownedItems++;
            }
        }

        MarketItem[] memory marketItems = new MarketItem[](ownedItems);
        uint256 index = 0;

        for (uint256 i = 0; i < itemsCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                marketItems[index] = currentItem;
                index++;
            }
        }

        return marketItems;
    }

    // Add retrieve all my NFTs

    function fetchAllItems() public view returns (MarketItem[] memory) {
        uint256 itemsCount = _itemIds.current();
        MarketItem[] memory marketItems = new MarketItem[](itemsCount);

        for (uint256 i = 0; i < itemsCount; i++) {
            MarketItem storage currentItem = idToMarketItem[i + 1];
            marketItems[i] = currentItem;
        }

        return marketItems;
    }

    // function onERC721Received(
    //     address operator,
    //     address from,
    //     uint256 tokenId,
    //     bytes calldata data
    // ) external pure override returns (bytes4) {
    //     operator;
    //     from;
    //     tokenId;
    //     data;
    //     return 0x150b7a02;
    // }
}
