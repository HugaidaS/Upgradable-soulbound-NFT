// import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { TestTokenV1__factory, TestTokenV2__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';

// Test drafts

describe('Contract Version 1 test', () => {
  let contract: Contract, implementation: string;
  let owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TokenV1 = new TestTokenV1__factory(owner);
    contract = await upgrades.deployProxy(TokenV1, [], {
      initializer: 'initialize',
      kind: 'uups',
    });
    implementation = await upgrades.erc1967.getImplementationAddress(
      contract.address
    );
    // add {call: {fn: 'reInitialize'} into options if you have a reinitialize function inside a new version
  });

  describe('Deployment', () => {
    it('Contract deployed with proper address', async () => {
      console.log('Token V1 proxy: ', contract.address);
      console.log('Implementation: ', implementation);
      console.log('Signer: ', owner.address);
      expect(contract.address).to.be.properAddress;
    });

    it('Should set the right owner', async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe('Add admin', () => {
    it('Should set the contract owner as the first admin', async function () {
      expect(await contract.admins(owner.address)).to.equal(true);
    });

    it('Should be false if the connected user is not admin', async function () {
      expect(await contract.admins(addr1.address)).to.equal(false);
    });

    it('Contract owner can add a new Admin', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
    });

    it('User can`t add a new Admin', async () => {
      await expect(
        contract.connect(addr1).addAdmin(addr1.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Disable Admin', () => {});

  describe('Mint', () => {
    it('Contract owner can mint token', async () => {
      await contract.connect(owner).mint(addr1.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
    });

    it('Admin can mint token', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      await contract.connect(addr1).mint(addr2.address, 'Token string URI 2');
      expect(await contract.tokenURI(0)).to.equal('Token string URI 2');
    });
    it('User can`t mint token', async () => {
      await expect(
        contract.connect(addr1).mint(addr2.address, 'Token string URI 2')
      ).to.be.revertedWith(
        'Restricted: Caller of the function is not in the admin list.'
      );
    });

    it('Should set the right token owner', async () => {
      await contract.connect(owner).mint(addr1.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(await contract.ownerOf(0)).to.equal(addr1.address);
    });
  });

  // Burn token

  describe('Burn', () => {});

  // Transfer token
  describe('Transfer', () => {});

  // it('Admin can mint token', async () => {});
  // it('Users cannot mint tokens', async () => {});
  // it('Token owner should be able to burn it', async () => {});
  // it('Not owner should NOT be able to burn it', async () => {});
  // it('No one can transfer the token once its minted', async () => {});

  // not deployed if the owner's balance is 0
});

describe('Contract Version 2 test', function () {
  let oldContract: Contract, upgradedContract: Contract;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const TokenV1 = new TestTokenV1__factory(owner);
    const TokenV2 = new TestTokenV2__factory(owner);

    oldContract = await upgrades.deployProxy(TokenV1, [], {
      initializer: 'initialize',
      kind: 'uups',
    });
    upgradedContract = await upgrades.upgradeProxy(
      oldContract.address,
      TokenV2,
      {
        kind: 'uups',
      }
    );
    // add {call: {fn: 'reInitialize'} into options if you have a reinitialize function inside a new version
  });

  it('New contract should call sayHi2 function', async () => {
    expect(await upgradedContract.sayHi2()).to.equal('Hi from V2');
  });

  it('Old contract should NOT call sayHi2 function', async () => {
    const res = async () => await oldContract.sayHi2();
    expect(res()).to.be.rejectedWith(TypeError);
  });
});

