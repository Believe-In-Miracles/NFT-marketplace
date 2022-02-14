// We import Chai to use its asserting functions here.
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect, assert } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");
const zeroAddress = "0x0000000000000000000000000000000000000000";

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` recieves the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("TKO staking and utility token", function () {
    // Mocha has four functions that let you hook into the the test runner's
    // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

    // They're very useful to setup the environment for tests, and to clean it
    // up after they run.

    // A common pattern is to declare some variables, and assign them in the
    // `before` and `beforeEach` callbacks.

    // `beforeEach` will run before each test, re-deploying the contract every
    // time. It receives a callback, which can be async.
    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        // contract = await ethers.getContractFactory("Penguins");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.

        // const [deployer] = await ethers.getSigners();

        MarketPlace = await ethers.getContractFactory("NFTMarketplace");
        marketplace = await MarketPlace.deploy();
        await marketplace.deployed();
        console.log("StakingPool deployed to:", marketplace.address);

        MiracleToken = await ethers.getContractFactory("MiracleToken");
        miracletoken = await MiracleToken.deploy(marketplace.address);
        await miracletoken.deployed();
        console.log("NFT deployed to:", miracletoken.address);

        console.log("Deploying contracts with the account:", owner.address);

        console.log("Account balance:", (await owner.getBalance()).toString());
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await marketplace.owner()).to.equal(owner.address);
            expect(await miracletoken.owner()).to.equal(owner.address);
        });
    });
    describe("MiracleToken", function () {
        it("Should create a new NFT", async function () {
            const tokenId = await miracletoken.createToken();
            const [owner, buyer] = await ethers.getSigners();
            await expect(await miracletoken.balanceOf(owner.address, 1)).to.be.equal(1);
        });
    });
    describe("NFTMarketPlace", function () {
        it("Should list a new NFT on the Marketplace", async function(){
            const tokenId = await miracletoken.createToken();
            const [owner, buyer] = await ethers.getSigners();
            await expect(await miracletoken.balanceOf(owner.address, 1)).to.be.equal(1);

            let itemsTemp = await marketplace.fetchAllItems()

            itemsTemp = await Promise.all(itemsTemp.map(async i => {
            //   const tokenUri = await miracletoken.tokenURI(i.tokenId);
              let item = {
                id: i.itemId.toString(),
                tokenId: i.tokenId.toString(),
                owner: i.owner,
                lastSeller: i.lastSeller,
                price: i.price.toString(),
                tokenUri: i.tokenId
              }
              return item
            }))

            expect(itemsTemp.length == 0)

            await marketplace.createMarketItem(1, miracletoken.address);

            let items = await marketplace.fetchAllItems()

            items = await Promise.all(items.map(async i => {
            //   const tokenUri = await miracletoken.tokenURI(i.tokenId);
              let item = {
                id: i.itemId.toString(),
                tokenId: i.tokenId.toString(),
                owner: i.owner,
                lastSeller: i.lastSeller,
                price: i.price.toString(),
                tokenUri: i.tokenId
              }
              return item
            }))

            expect(items.length == 1)

        });
        it("Should fail - Only Owner can list", async function () {
            const [owner, buyer] = await ethers.getSigners();
            let hasFailed = false;
            try {
                await marketplace.connect(buyer).createMarketItem(1, miracletoken.address);
            } catch (e) {
                hasFailed = true;
            }
            assert.equal(hasFailed, true);
        });
        it("Should put a new item on sale", async function () {
           
            let itemsTemp = await marketplace.fetchAllItemsOnSale()
            try {
                itemsTemp = await Promise.all(itemsTemp.map(async i => {
                    // const tokenUri = await nft.tokenURI(i.tokenId);
                    let item = {
                        id: i.itemId.toString(),
                        tokenId: i.tokenId.toString(),
                        owner: i.owner,
                        lastSeller: i.lastSeller,
                        price: i.price.toString(),
                        tokenUri: i.tokenId
                    }
                    return item
                }))
            } catch (e) {

            }


            expect(itemsTemp.length == 0)

            const listingFees = ethers.utils.parseUnits('0.025', 'ether');
            
            const tokenId = await miracletoken.createToken();
            const [owner, buyer] = await ethers.getSigners();
            await expect(await miracletoken.balanceOf(owner.address, 1)).to.be.equal(1);
            
            let hasFailed = false;
            try {
                await marketplace.createMarketItem(1, miracletoken.address);
            } catch (e) {
                hasFailed = true;
            }
            assert.equal(hasFailed, false);

            await marketplace.listItemOnSale(1, miracletoken.address, listingFees, { value: listingFees });



            let items = await marketplace.fetchAllItemsOnSale()

            items = await Promise.all(items.map(async i => {
                // const tokenUri = await nft.tokenURI(i.tokenId);
                let item = {
                    id: i.itemId.toString(),
                    tokenId: i.tokenId.toString(),
                    owner: i.owner,
                    lastSeller: i.lastSeller,
                    price: i.price.toString(),
                    tokenUri: i.tokenId
                }
                return item
            }))

            expect(items.length == 1)
        });
    });

});
