import { ethers, upgrades,network, run } from "hardhat";
import fs from 'fs';

async function main() {
  const WAIT_BLOCK_CONFIRMATIONS = 6;
  const TokenV1 = await ethers.getContractFactory("TestTokenV1");
  let contract = await upgrades.deployProxy(TokenV1, [], {
    initializer: 'initialize',
    kind: 'uups',
  });

  await contract.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

  console.log(`Contract NFT token deployed to ${contract.address} on ${network.name}`);
  console.log(`Verifying contract on Polygonscan...`);

  await run(`verify:verify`, {
    address: contract.address,
    constructorArguments: [],
  });

  fs.writeFileSync('./config.js',`export const NFT_address = "${contract.address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
