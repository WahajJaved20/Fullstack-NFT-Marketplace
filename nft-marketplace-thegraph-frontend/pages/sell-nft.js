import { ethers } from "ethers";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Form, useNotification } from "web3uikit";
import basicNftAbi from "../constants/basicAbi.json";
import nftMarketplaceAbi from "../constants/nftAbi.json";
import networkMapping from "../constants/networkMapping.json";
import { useState, useEffect } from "react";
import { Button } from "web3uikit";
export default function Sell() {
  const { chainId, account, isWeb3Enabled } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
  const dispatch = useNotification();
  const { runContractFunction } = useWeb3Contract();
  const [proceeds, setProceeds] = useState("0");
  async function approveAndList(data) {
    const nftAddress = data.data[0].inputResult;
    const tokenId = data.data[1].inputResult;
    const price = ethers.utils
      .parseUnits(data.data[2].inputResult, "ether")
      .toString();
    const approveOptions = {
      abi: basicNftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };
    await runContractFunction({
      params: approveOptions,
      onSuccess: handleApproveSuccess(nftAddress, tokenId, price),
      onError: (error) => console.log(error),
    });
  }
  const handleApproveSuccess = async (nftAddress, tokenId, price) => {
    const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };
    await runContractFunction({
      params: listOptions,
      onError: (error) => console.log(error),
      onSuccess: handleListSucess,
    });
  };
  const handleListSucess = async (tx) => {
    await tx.wait(1);
    await dispatch({
      type: "success",
      message: "NFT Listing",
      title: "NFT Listed",
      position: "topR",
    });
  };
  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      title: "Withdraw",
      position: "topR",
    });
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account,
        },
      },
      onError: (error) => console.log(error),
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setupUI();
    }
  }, [proceeds, account, isWeb3Enabled, chainId]);

  return (
    <div>
      <Form
        onSubmit={approveAndList}
        title="Sell Your NFT"
        data={[
          {
            name: "NFT Address",
            type: "text",
            inputWidth: "50%",
            value: "",
            key: "nftAddress",
          },
          {
            name: "Token ID",
            type: "number",
            value: "",
            key: "tokenId",
          },
          {
            name: "Price in ETH",
            type: "number",
            value: "",
            key: "price",
          },
        ]}
      />
      <div>Withdraw {proceeds} proceeds</div>
      {proceeds != "0" ? (
        <Button
          onClick={() => {
            runContractFunction({
              params: {
                abi: nftMarketplaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
              },
              onError: (error) => console.log(error),
              onSuccess: handleWithdrawSuccess,
            });
          }}
          text="Withdraw"
          type="button"
        />
      ) : (
        <div>No proceeds detected</div>
      )}
    </div>
  );
}
