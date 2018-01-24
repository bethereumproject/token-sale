/**
 * Created by buben42 on 28.12.2017.
 */
const expectThrow = require('./utils').expectThrow

const MULTISIG = artifacts.require('MultiSigWallet')
let MSW

contract('MultiSigWallet', function (accounts) {

  const OWNER1 = accounts[0];
  const OWNER2 = accounts[1];
  const NONOWNER = accounts[2];

  beforeEach(async () => {
    MSW = await MULTISIG.new([OWNER1,OWNER2],2,{from: OWNER1})
    web3.eth.sendTransaction({to: MSW.address, value: 10000000000000000000, from: accounts[0]})
  })

  it('init: should have set Owners', async () => {
    const isOwner1 = await MSW.isOwner.call(OWNER1)
    const isOwner2 = await MSW.isOwner.call(OWNER2)
    const required = await MSW.required.call()
    const balance = await web3.eth.getBalance(MSW.address);
    assert.isTrue(isOwner1);
    assert.isTrue(isOwner2);
    assert.equal(required.toNumber(), 2, 'required confirmations do not match')
    assert.equal(balance.toNumber(), 10000000000000000000, 'initial balance does not match')
  })

  it('submit: should accept all owners', async () => {
    const tx1 = await MSW.submitTransaction(accounts[3], 1000000000000000000, '0x', {from: OWNER1})
    const tx2 = await MSW.submitTransaction(accounts[4], 1000000000000000000, '0x', {from: OWNER2})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const id2 = tx2.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    assert.equal(id1,0,'Contract was not empty')
    assert.equal(id2,1,'Contract was not empty')
  })

  it('submit: should not accept non owners', async () => {
    expectThrow(MSW.submitTransaction(accounts[3], 1000000000000000000, '0x', {from: NONOWNER}))
  })

  it('confirm/execute: should accept confirmations from owners', async () => {
    const balance3a = await web3.eth.getBalance(accounts[3]);
    const tx1 = await MSW.submitTransaction(accounts[3], 1000000000000000000, '0x', {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')

    await MSW.confirmTransaction(id1, {from: OWNER2})
    const confirmations2 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations2.toNumber(), 2, 'should have 2 confirmations')
    const balance3b = await web3.eth.getBalance(accounts[3]);
    assert.equal(balance3b.toNumber(), (balance3a.toNumber()+1000000000000000000), 'transacation should have been executed')
  })

  it('confirm/execute: should NOT accept confirmations from NON owners', async () => {
    const balance3a = await web3.eth.getBalance(accounts[3]);
    const tx1 = await MSW.submitTransaction(accounts[3], 1000000000000000000, '0x', {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')

    expectThrow(MSW.confirmTransaction(id1, {from: NONOWNER}))
    const confirmations2 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations2.toNumber(), 1, 'should still have 1 confirmation')
    const balance3b = await web3.eth.getBalance(accounts[3]);
    assert.equal(balance3b.toNumber(), balance3a.toNumber(), 'no transaction should have been executed')
  })

  it('execute: should allow execution after lowering requirement', async () => {
    const balance3a = await web3.eth.getBalance(accounts[3]);
    const requirement = await MSW.required.call()
    assert.equal(requirement, 2, 'should be as set')

    const tx1 = await MSW.submitTransaction(accounts[3], 1000000000000000000, '0x', {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')

    // Data = changeRequirement to 1
    const tx2 = await MSW.submitTransaction(MSW.address, 0, '0xba51a6df0000000000000000000000000000000000000000000000000000000000000001', {from: OWNER1})
    const id2 = tx2.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    await MSW.confirmTransaction(id2, {from: OWNER2})

    const changedRequirement = await MSW.required.call()
    assert.equal(changedRequirement, 1, 'should be lowered')
    const confirmations2 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations2.toNumber(), 1, 'should still have 1 confirmation')
    const balance3b = await web3.eth.getBalance(accounts[3]);
    assert.equal(balance3b.toNumber(), balance3a.toNumber(), 'no transaction should have been executed')

    await MSW.executeTransaction(id1, {from: NONOWNER})
    const balance3c = await web3.eth.getBalance(accounts[3]);
    assert.equal(balance3c.toNumber(), (balance3a.toNumber()+1000000000000000000), 'transaction should have been executed')

  })

  it('change owners: should allow owner removal', async () => {
    const isOwner1 = await MSW.isOwner.call(OWNER1)
    const isOwner2 = await MSW.isOwner.call(OWNER2)
    assert.isTrue(isOwner1)
    assert.isTrue(isOwner2)
    const txData = '0x173825d9000000000000000000000000'+ OWNER2.substring(2,50)
    const tx1 = await MSW.submitTransaction(MSW.address, 0, txData, {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')
    await MSW.confirmTransaction(id1, {from: OWNER2})

    const isOwner1b = await MSW.isOwner.call(OWNER1)
    const isOwner2b = await MSW.isOwner.call(OWNER2)
    assert.isTrue(isOwner1b)
    assert.isFalse(isOwner2b)

    const requirement = await MSW.required.call()
    assert.equal(requirement.toNumber(), 1, 'should be as set')
  })

  it('change owners: should allow to add new owner', async () => {
    const isOwner1 = await MSW.isOwner.call(OWNER1)
    const isOwner2 = await MSW.isOwner.call(OWNER2)
    const isOwner3 = await MSW.isOwner.call(NONOWNER)
    assert.isTrue(isOwner1)
    assert.isTrue(isOwner2)
    assert.isFalse(isOwner3)
    const txData = '0x7065cb48000000000000000000000000'+NONOWNER.substring(2,50)
    const tx1 = await MSW.submitTransaction(MSW.address, 0, txData, {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')
    await MSW.confirmTransaction(id1, {from: OWNER2})
    const isOwner1b = await MSW.isOwner.call(OWNER1)
    const isOwner2b = await MSW.isOwner.call(OWNER2)
    const isOwner3b = await MSW.isOwner.call(NONOWNER)
    assert.isTrue(isOwner1b)
    assert.isTrue(isOwner2b)
    assert.isTrue(isOwner3b)
    const requirement = await MSW.required.call()
    assert.equal(requirement.toNumber(), 2, 'should be as set')
  })

  it('change owners: should allow to swap owners', async () => {
    const isOwner1 = await MSW.isOwner.call(OWNER1)
    const isOwner2 = await MSW.isOwner.call(OWNER2)
    const isOwner3 = await MSW.isOwner.call(NONOWNER)
    assert.isTrue(isOwner1)
    assert.isTrue(isOwner2)
    assert.isFalse(isOwner3)
    const txData = '0xe20056e6000000000000000000000000'+OWNER2.substring(2,50)+'000000000000000000000000'+NONOWNER.substring(2,50)
    const tx1 = await MSW.submitTransaction(MSW.address, 0, txData, {from: OWNER1})
    const id1 = tx1.logs.find(element => element.event.match('Submission')).args.transactionId.toNumber()
    const confirmations1 = await MSW.getConfirmationCount.call(id1)
    assert.equal(confirmations1.toNumber(), 1, 'should have 1 confirmation')
    await MSW.confirmTransaction(id1, {from: OWNER2})
    const isOwner1b = await MSW.isOwner.call(OWNER1)
    const isOwner2b = await MSW.isOwner.call(OWNER2)
    const isOwner3b = await MSW.isOwner.call(NONOWNER)
    assert.isTrue(isOwner1b)
    assert.isFalse(isOwner2b)
    assert.isTrue(isOwner3b)
    const requirement = await MSW.required.call()
    assert.equal(requirement.toNumber(), 2, 'should be as set')
  })

})
