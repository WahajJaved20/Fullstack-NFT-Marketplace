import { useMoralisQuery, useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
export default function Home() {
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    "ActiveItem",
    (query) => query.limit(10).descending("tokenId")
  );
  const { isWeb3Enabled } = useMoralis();
  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          fetchingListedNfts ? (
            <div>Loading ...</div>
          ) : (
            listedNfts.map((nft) => {
              const { price, nftAddress, tokenId, marketplaceAddress, seller } =
                nft.attributes;
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
