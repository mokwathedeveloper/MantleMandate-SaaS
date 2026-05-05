import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config({ path: "../backend/.env" });

const DUMMY_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const rawKey = process.env.MANTLE_PRIVATE_KEY || "";
const MANTLE_PRIVATE_KEY = rawKey.length === 66 ? rawKey : DUMMY_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: { chainId: 31337 },
    mantle_testnet: {
      url: process.env.MANTLE_TESTNET_RPC_URL || "https://rpc.sepolia.mantle.xyz",
      chainId: 5003,
      accounts: [MANTLE_PRIVATE_KEY],
    },
    mantle_mainnet: {
      url: process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz",
      chainId: 5000,
      accounts: [MANTLE_PRIVATE_KEY],
    },
  },
};

export default config;
