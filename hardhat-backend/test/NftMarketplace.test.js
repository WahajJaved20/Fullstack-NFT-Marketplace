const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFT Marketplace", function () {
      let nftMarketplace, basicNft, deployer, player;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        const accounts = await ethers.getSigners();
        player = accounts[1];
        await deployments.fixture("all");
        nftMarketplace = await ethers.getContract("NftMarketplace", deployer);
        basicNft = await ethers.getContract("BasicNft", deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplace.address, TOKEN_ID);
      });

      describe("Listing Item", function () {
        it("revert if trying to list with 0 price", async function () {
          expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
          ).to.be.revertedWith("PriceMustBeAboveZero");
        });
        it("revert if trying to list an already listed item", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("AlreadyListed");
        });
        it("check if the player is the owner", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const playerConnectedNftMarketplace = await nftMarketplace.connect(
            player
          );
          await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          const newOwner = await basicNft.ownerOf(TOKEN_ID);
          assert.equal(newOwner.toString(), player.address);
        });
        it("check if deployer got the funds", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const playerConnectedNftMarketplace = await nftMarketplace.connect(
            player
          );
          await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          const deployerProceeds = await nftMarketplace.getProceeds(deployer);
          assert.equal(deployerProceeds.toString(), PRICE.toString());
        });
        it("reverts if enough funds are not sent", async function () {
          expect(
            nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("PriceMustBeAboveZero");
        });
      });
      describe("withdraw proceeds", function () {
        it("checks if error is shown if there are no funds", async function () {
          const currentProceeds = await nftMarketplace.getProceeds(deployer);
          assert.equal(currentProceeds.toString(), "0");
          expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
            "NoProceeds"
          );
        });
        it("checks if the amount is updated", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const playerConnectedNftMarketplace = await nftMarketplace.connect(
            player
          );
          await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          const newProceeds = await nftMarketplace.getProceeds(deployer);
          assert(newProceeds > 0);
        });
        it("checks if total amount is withdrawn", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const playerConnectedNftMarketplace = await nftMarketplace.connect(
            player
          );
          await playerConnectedNftMarketplace.buyItem(
            basicNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          await nftMarketplace.withdrawProceeds();
          const finalProceeds = await nftMarketplace.getProceeds(deployer);
          assert.equal(finalProceeds, 0);
        });
      });
      describe("update listing", function () {
        it("revert if the item is not listed", async function () {
          expect(
            nftMarketplace.updateListing(
              basicNft.address,
              TOKEN_ID,
              ethers.utils.parseEther("0.2")
            )
          ).to.be.revertedWith("NotListed");
        });
        it("revert if the person trying to update is not the owner", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const trialPrice = ethers.utils.parseEther("0.2");
          nftMarketplace.connect(player);
          expect(
            nftMarketplace.updateListing(basicNft.address, TOKEN_ID, trialPrice)
          ).to.be.revertedWith("NotOwner");
        });
        it("update and see if the new price is updated", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace.updateListing(
            basicNft.address,
            TOKEN_ID,
            ethers.utils.parseEther("0.2")
          );
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          const newPrice = listing.price;
          const trialPrice = ethers.utils.parseEther("0.2");
          assert.equal(newPrice.toString(), trialPrice);
        });
        it("check if the Item Listed event was emitted", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await new Promise(async (resolve, reject) => {
            setTimeout(resolve, 300);
            nftReciept.once("ItemListed", async function () {
              try {
                const eventPrice = await nftReciept.events[1].args.price;
                assert.equal(eventPrice.toString(), newPrice.toString());
                resolve();
              } catch (e) {
                console.error(e);
                reject(e);
              }
            });
            await nftMarketplace.updateListing(
              basicNft.address,
              TOKEN_ID,
              ethers.utils.parseEther("0.2")
            );
            console.log("here as well");
          });
        });
      });
      describe("Cancel Listing", function () {
        it("Check if item is successfully deleted", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
          const deletedListing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          assert.equal(
            deletedListing.seller.toString(),
            "0x0000000000000000000000000000000000000000"
          );
        });
        it("Check if the event Item cancelled was emitted", async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          await new Promise(async (resolve, reject) => {
            setTimeout(resolve, 300);
            nftMarketplace.once("ItemCancelled", async function () {
              try {
                const deleter = await nftMarketplace.events[1].args.sender;
                assert.equal(deleter.toString(), deployer.toString());
                resolve();
              } catch (e) {
                console.error(e);
                reject(e);
              }
            });
            await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID);
          });
        });
      });
      describe("buy an item", function () {
        let playerConnectedContract;
        beforeEach(async function () {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          playerConnectedContract = nftMarketplace.connect(player);
        });
        it("revert if enough funds are not given", async function () {
          expect(
            playerConnectedContract.buyItem(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("PriceNotMet");
        });
        it("check if item is removed from list after buying successfully", async function () {
          await playerConnectedContract.buyItem(basicNft.address, TOKEN_ID, {
            value: PRICE,
          });
          const deletedItem = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          assert.equal(
            deletedItem.seller.toString(),
            "0x0000000000000000000000000000000000000000"
          );
        });
        it("check if the event item bought was emitted", async function () {
          await nftMarketplace.connect(player);
          expect(
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit("ItemBought");
        });
      });
    });
