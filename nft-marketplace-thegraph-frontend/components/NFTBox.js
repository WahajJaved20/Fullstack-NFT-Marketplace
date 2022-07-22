import { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import nftMarketplaceAbi from "../constants/nftAbi.json";
import basicNftAbi from "../constants/basicAbi.json";
import Image from "next/image";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";
const truncateStr = (fullStr, strLen) => {
  if (fullStr.length <= strLen) {
    return fullStr;
  }
  const separator = "...";
  const separatorLength = separator.length;
  const charsToShow = strLen - separatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.ceil(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};
export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  marketplaceAddress,
  seller,
}) {
  const dispatch = useNotification();
  const { isWeb3Enabled, account } = useMoralis();
  const [imageUri, setImageUri] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => {
    setShowModal(false);
  };
  const { runContractFunction: tokenUri } = useWeb3Contract({
    abi: basicNftAbi,
    contractAddress: nftAddress,
    functionName: "tokenURI",
    params: { tokenId: tokenId },
  });
  const { runContractFunction: buyItem } = useWeb3Contract({
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "buyItem",
    msgValue: price,
    params: { nftAddress: nftAddress, tokenId: tokenId },
  });
  async function updateUI() {
    console.log(tokenId);
    const tokenURI = await tokenUri();
    console.log(tokenURI);
    if (tokenURI) {
      // now we will use IPFS gateway: a server to access IPFS files in HTTP since everyone wont have it
      const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await (await fetch(requestURL)).json();
      const imageUri = tokenURIResponse.image;
      const imageURIURL = imageUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      setImageUri(imageURIURL);
      setTokenName(tokenURI.name);
      setTokenDescription(tokenURI.description);
    }
  }
  const handleCardClick = async () => {
    console.log(nftAddress);
    isOwner
      ? setShowModal(true)
      : await buyItem({
          onError: (error) => console.log(error),
          onSuccess: handleBuyItemSuccess,
        });
  };
  const handleBuyItemSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Item Bought",
      position: "topR",
      title: "Item Bought!",
    });
  };
  const isOwner = seller == account;
  const formattedSellerAddress = isOwner
    ? "you"
    : truncateStr(seller || "", 15);
  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled, account, showModal, isOwner, formattedSellerAddress]);

  return (
    <div>
      <UpdateListingModal
        isVisible={showModal}
        tokenId={tokenId}
        marketplaceAddress={marketplaceAddress}
        nftAddress={nftAddress}
        onClose={hideModal}
      />
      <div>
        {imageUri ? (
          <Card
            title={tokenName}
            description={tokenDescription}
            onClick={handleCardClick}
          >
            <div className="p-2">
              <div className="flex flex-col items-end gap-2">
                <div>#{tokenId}</div>
                <div className="italic text-sm">
                  Owned by {formattedSellerAddress}
                </div>
                <Image
                  loader={() => imageUri}
                  src={imageUri}
                  width="200"
                  height="200"
                />
                <div className="font-bold">
                  Price: {ethers.utils.formatUnits(price, "ether")} ETH
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
