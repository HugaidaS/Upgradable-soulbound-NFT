import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { TestToken__factory } from '../typechain-types';

describe('Token contract', function () {
  it('Deployment should assign the total supply of tokens to the owner', async function () {
    const [owner] = await ethers.getSigners();

    const token = await new TestToken__factory(owner).deploy();

    console.log(token.address, 'Token deployed');
    expect(token.address).to.be.properAddress;
  });
});

