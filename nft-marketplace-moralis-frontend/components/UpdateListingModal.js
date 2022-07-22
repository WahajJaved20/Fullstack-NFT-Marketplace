import { useState } from "react";
import { Modal, Input, useNotification } from "web3uikit";
import { useWeb3Contract } from "react-moralis";
import NftMarketplaceAbi from "../constants/nftAbi.json";
import { ethers } from "ethers";
export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch(
      {
        type: "success",
        message: "Listing Updated",
        title: "Listing Updated - Please Refresh",
        position: "topR",
      },
      onClose && onClose(),
      setPriceToUpdateListingWith("0")
    );
  };
  const { runContractFunction: updateListing } = useWeb3Contract({
    abi: NftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: "updateListing",
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
    },
  });
  const dispatch = useNotification();
  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (error) => {
            console.log(error);
          },
          onSuccess: handleUpdateListingSuccess,
        });
      }}
    >
      <Input
        label="Update Listing Price in ETH"
        name="New Listing Price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      />
    </Modal>
  );
}
