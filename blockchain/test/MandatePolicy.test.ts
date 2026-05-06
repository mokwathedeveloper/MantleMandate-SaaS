import { expect } from 'chai'
import { ethers } from 'hardhat'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import type { MandatePolicy } from '../typechain-types'

describe('MandatePolicy', () => {
  let contract: MandatePolicy
  let owner: any
  let other: any

  // SHA-256 of '{"asset":"ETH"}' as bytes32
  const HASH_A = ethers.keccak256(ethers.toUtf8Bytes('policy-a'))
  const HASH_B = ethers.keccak256(ethers.toUtf8Bytes('policy-b'))

  beforeEach(async () => {
    ;[owner, other] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('MandatePolicy')
    contract      = (await Factory.deploy()) as unknown as MandatePolicy
    await contract.waitForDeployment()
  })

  it('registers a policy hash and emits event', async () => {
    await expect(contract.connect(owner).submitPolicy(HASH_A))
      .to.emit(contract, 'PolicySubmitted')
      .withArgs(owner.address, HASH_A, 0n, anyValue)
  })

  it('verifyPolicy returns true for registered active hash', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    expect(await contract.verifyPolicy(owner.address, HASH_A)).to.be.true
  })

  it('verifyPolicy returns false for wrong owner', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    expect(await contract.verifyPolicy(other.address, HASH_A)).to.be.false
  })

  it('reverts on duplicate hash submission', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    await expect(contract.connect(owner).submitPolicy(HASH_A))
      .to.be.revertedWith('MandatePolicy: already registered')
  })

  it('reverts on zero hash', async () => {
    await expect(contract.connect(owner).submitPolicy(ethers.ZeroHash))
      .to.be.revertedWith('MandatePolicy: zero hash')
  })

  it('revokePolicy deactivates a hash', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    await expect(contract.connect(owner).revokePolicy(HASH_A))
      .to.emit(contract, 'PolicyRevoked')
      .withArgs(owner.address, HASH_A)
    expect(await contract.verifyPolicy(owner.address, HASH_A)).to.be.false
  })

  it('non-owner cannot revoke', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    await expect(contract.connect(other).revokePolicy(HASH_A))
      .to.be.revertedWith('MandatePolicy: not owner')
  })

  it('getPolicies returns all submitted hashes', async () => {
    await contract.connect(owner).submitPolicy(HASH_A)
    await contract.connect(owner).submitPolicy(HASH_B)
    const policies = await contract.getPolicies(owner.address)
    expect(policies).to.have.lengthOf(2)
    expect(policies[0].hash).to.equal(HASH_A)
    expect(policies[1].hash).to.equal(HASH_B)
  })
})
