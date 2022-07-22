const networkConfig = {
  4: {
    name: "rinkeby",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  developmentChains,
};
