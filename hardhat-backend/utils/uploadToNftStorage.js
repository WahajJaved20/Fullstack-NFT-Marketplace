const { NFTStorage, File } = require("nft.storage");
const mime = require("mime");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;
async function storeNFTs(imagesPath) {
  const fullImagesPath = path.resolve(imagesPath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  for (fileIndex in files) {
    const image = await fileFromPath(`${fullImagesPath}/${files[fileIndex]}`);
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
    const dogName = files[fileIndex].replace(".png", "");
    const response = await nftstorage.store({
      image,
      name: dogName,
      description: `An adorable ${dogName}`,
    });
    responses.push(response);
  }
  return responses;
}
async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], path.basename(filePath), { type });
}

module.exports = {
  storeNFTs,
};
