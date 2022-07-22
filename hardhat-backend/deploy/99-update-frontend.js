const { ethers, network } = require("hardhat");
const fs = require("fs");
const frontEndContractsFile =
  "../nft-marketplace-moralis-frontend/constants/networkMapping.json";
const frontEndNftAbiFile =
  "../nft-marketplace-moralis-frontend/constants/nftAbi.json";

const frontEndBasicAbiFile =
  "../nft-marketplace-moralis-frontend/constants/basicAbi.json";
module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating frontend ... ");
    await updateContractAddresses();
    await updateContractAbi();
  }
};

async function updateContractAbi() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  fs.writeFileSync(
    frontEndNftAbiFile,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );
  const basicNft = await ethers.getContract("BasicNft");
  fs.writeFileSync(
    frontEndBasicAbiFile,
    basicNft.interface.format(ethers.utils.FormatTypes.json)
  );
}
async function updateContractAddresses() {
  const nftMarketplace = await ethers.getContract("NftMarketplace");
  const chainId = network.config.chainId.toString();
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["NftMarketplace"].includes(
        nftMarketplace.address
      )
    ) {
      contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address);
    }
  } else {
    contractAddresses[chainId] = {
      NftMarketplace: [nftMarketplace.address],
    };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];
