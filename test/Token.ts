import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { TestTokenV1__factory, TestTokenV2__factory } from '../typechain-types';

// Test drafts

describe('Token contract deployment', function () {
  it('Deployed with proper address', async function () {
    const [owner] = await ethers.getSigners();

    const Token = new TestTokenV1__factory(owner);
    const tokenProxy = await upgrades.deployProxy(Token, [], {
      initializer: 'initialize',
    });
    const tokenImplementationAddress =
      await upgrades.erc1967.getImplementationAddress(tokenProxy.address);
    const tokenProxyAdminAddress = await upgrades.erc1967.getAdminAddress(
      tokenProxy.address
    );

    console.log('Token proxy: ', tokenProxy.address);
    console.log('Token implementation: ', tokenImplementationAddress);
    console.log('Token Admin: ', tokenProxyAdminAddress);
    console.log('Signer: ', owner.address);

    const TokenV2 = new TestTokenV2__factory(owner);
    console.log('Upgrade to V2');
    const tokenV2 = await upgrades.upgradeProxy(tokenProxy, TokenV2);
    const tokenV2ProxyAdminAddress = await upgrades.erc1967.getAdminAddress(
      tokenProxy.address
    );
    console.log('Token V2 proxy (should be the same): ', tokenV2.address);
    console.log('Token Admin: ', tokenV2ProxyAdminAddress);
    console.log('Signer: ', owner.address);

    expect(tokenProxy.address).to.be.properAddress;
  });

  // not deployed if the owner's balance is 0
});

describe('Token functionality', function () {
  // add admin
  // remove admin
  // mint token by the admin-owner
  // mint token by the admin but not owner
  // others can't mint tokens
  // token owner can burn token
  // token owner can't transfer token
  // not token owner (including contract owner) cannot burn or transfer
});

describe('Token upgradability', function () {
  // mint token by the admin-owner
  // mint token by the admin but not owner
  // others can't mint tokens
  // token owner can burn token
  // token owner can't transfer token
  // not token owner (including contract owner) cannot burn or transfer
});

describe('Upgraded token functionality', function () {
  // mint token by the admin-owner
  // mint token by the admin but not owner
  // others can't mint tokens
  // token owner can burn token
  // token owner can't transfer token
  // not token owner (including contract owner) cannot burn or transfer
});

