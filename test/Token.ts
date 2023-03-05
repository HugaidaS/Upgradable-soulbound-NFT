// import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
// import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';
import { TestTokenV1__factory, TestTokenV2__factory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract, constants } from 'ethers';

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
      expect(
        contract.connect(addr1).addAdmin(addr2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Admin can`t add a new Admin', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      expect(
        contract.connect(addr1).addAdmin(addr2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  // TODO: Finish test suite
  describe('Disable Admin', () => {
    it('Should be false if the connected user is not the admin', async function () {
      expect(await contract.admins(addr1.address)).to.equal(false);
    });

    it('Should be true if the connected user is the owner', async function () {
      expect(await contract.admins(owner.address)).to.equal(true);
    });

    it('Contract owner can`t disable the Admin that is not enabled', async () => {
      expect(
        contract.connect(owner).disableAdmin(addr2.address)
      ).to.be.revertedWith('This address does not exist in the admin list');
    });

    it('Contract owner can disable Admin that is enabled', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      await contract.connect(owner).disableAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(false);
    });

    it('User can`t disable the Admin', async () => {
      expect(
        contract.connect(addr1).disableAdmin(addr2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it('Admin can`t disable himself', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      expect(
        contract.connect(addr1).disableAdmin(addr1.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
    it('Admin can`t disable another Admin', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      await contract.connect(owner).addAdmin(addr2.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      expect(await contract.admins(addr2.address)).to.equal(true);
      expect(
        contract.connect(addr1).disableAdmin(addr2.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Mint', () => {
    it('Can`t mint to zero address', async () => {
      expect(contract.connect(owner).mint(constants.AddressZero, 'Token string URI')).to.be.revertedWith("ERC721: mint to the zero address");
    });

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
      expect(
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

  describe('Burn', () => {
    it('Contract owner can`t burn token', async () => {
      await contract.connect(owner).mint(addr1.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(
        contract.connect(owner).burn(0)
      ).to.be.revertedWith(
        'ERC721: caller is not token owner or approved'
      );
    });

    it('Admin can`t burn token', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      await contract.connect(owner).mint(addr2.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(
        contract.connect(addr1).burn(0)
      ).to.be.revertedWith(
        'ERC721: caller is not token owner or approved'
      );
    });

    it('Token owner can burn token', async () => {
      await contract.connect(owner).mint(addr2.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(await contract.connect(addr2).burn(0)).to.be.revertedWith("ERC721: invalid token ID");
    });
  });
  describe('Transfer', () => {
    it('Token owner can`t transfer token', async () => {
      await contract.connect(owner).mint(addr2.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(await contract.connect(addr2).transferFrom(addr2.address, addr1.address,0)).to.be.revertedWith("This is a Soulbound token. It cannot be transferred. It can only be burned by the owner.");
    });
    it('Admin can`t transfer token', async () => {
      await contract.connect(owner).addAdmin(addr1.address);
      expect(await contract.admins(addr1.address)).to.equal(true);
      await contract.connect(owner).mint(addr2.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(contract.connect(addr1).transferFrom(addr2.address, addr1.address, 0)).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
    it('Contract owner can`t transfer token', async () => {
      await contract.connect(owner).mint(addr2.address, 'Token string URI');
      expect(await contract.tokenURI(0)).to.equal('Token string URI');
      expect(contract.connect(owner).transferFrom(addr2.address, addr1.address, 0)).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });
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

  // TODO: Finish test suite
  describe('Proxy address should be the same', () => {});
  describe('Implementaion addresses should be different', () => {});
});

