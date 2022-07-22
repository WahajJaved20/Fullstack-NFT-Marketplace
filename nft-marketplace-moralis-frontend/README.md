# Pages

1. Home Page
   1. Show Recently Listed NFTs
      1. If you own the NFT, you can update the listing
      2. If you dont own the NFT, you can buy the listing
2. Sell Page
   1. You can sell your NFTs on the marketplace
   2. Withdraw Proceeds

// Using Moralis Indexer to store NFTs in a centralized database coz its fast
// moralis.io

# Moralis Database

1. Connect it to the blockchain
   1. Download frp
   2. use the .exe and .ini to connect to the local host
   3. replace frpc.ini contents with our database configs
   4. In order to connect
      1. yarn hardhat node in the backend
      2. yarn dev in frontend
      3. yarn moralis:sync and credentials and boom
2. Which contract, which events, and what to do when it hears those events
