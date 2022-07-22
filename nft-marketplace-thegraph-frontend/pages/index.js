import { useQuery } from "@apollo/client";
import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import GET_ACTIVE_ITEM from "../constants/subGraphQueries";
export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0];
  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEM);
  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !listedNfts ? (
            <div>Loading ...</div>
          ) : (
            listedNfts.activeItems.map((nft) => {
              const { price, nftAddress, tokenId, seller } = nft;
              console.log(marketplaceAddress);
              return (
                <div>
                  <NFTBox
                    price={price}
                    nftAddress={nftAddress}
                    marketplaceAddress={marketplaceAddress}
                    tokenId={tokenId}
                    seller={seller}
                    key={`${nftAddress}${tokenId}`}
                  />
                </div>
              );
            })
          )
        ) : (
          <div>Web3 not enabled</div>
        )}
      </div>
    </div>
  );
}
