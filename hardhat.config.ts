import { HardhatUserConfig } from 'hardhat/config';
import * as dotenv from 'dotenv'
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version:'0.8.17',
    },
  networks:{
    mumbai:{
      url:`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      chainId:80001,
      accounts:[process.env.PRIVATE_KEY || ""]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_KEY,
  },
};

export default config;

