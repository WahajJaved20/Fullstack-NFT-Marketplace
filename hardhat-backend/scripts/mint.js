const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");
const PRICE = ethers.utils.parseEther("0.1");
async function mint() {
  const basicNft = await ethers.getContract("BasicNft");
  const nftMarketplace = await ethers.getContract("NftMarketplace");

  console.log("Minting...");
  const mintTx = await basicNft.mintNft();
  const mintTxReciept = await mintTx.wait(1);
  const tokenId = mintTxReciept.events[0].args.tokenId;
  console.log(`Token ID: ${tokenId}`);
  console.log(`NFT Address : ${basicNft.address}`);
  if (network.config.chainId == 31337) {
    moveBlocks(2, (sleepAmount = 1000));
  }
  const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
  await approvalTx.wait(1);
}
mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
