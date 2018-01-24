/**
 * Derivative from source: https://github.com/ConsenSys/Tokens/blob/master/test/eip20/eip20.js
 */

const expectThrow = require('./utils').expectThrow
const EIP20Abstraction = artifacts.require('BethereumToken')
let TOKEN

contract('BTHRMToken_JJ', function (accounts) {
  beforeEach(async () => {
    TOKEN = await EIP20Abstraction.new({from: accounts[0]})
    await TOKEN.unpause({from: accounts[0]})
    await TOKEN.mint(accounts[0], '10000', {from: accounts[0]})
  })

  it('creation: should not create any tokens when created', async () => {
    const totalSupply = await TOKEN.totalSupply.call()
  assert.strictEqual(totalSupply.toNumber(), 10000)
  })

  it('creation: test correct setting of vanity information', async () => {
    const name = await TOKEN.name.call()
  assert.strictEqual(name, 'Bethereum Token')

  const decimals = await TOKEN.decimals.call()
  assert.strictEqual(decimals.toNumber(), 18)

  const symbol = await TOKEN.symbol.call()
  assert.strictEqual(symbol, 'BTT')
  })

  it('creation: should succeed in creating over 2^256 - 1 (max) tokens', async () => {
    // 2^256 - 1
    let TOKEN2 = await EIP20Abstraction.new({from: accounts[0]})
    await TOKEN2.mint(accounts[0], '115792089237316195423570985008687907853269984665640564039457584007913129639935', {from: accounts[0]})
    const totalSupply = await TOKEN2.totalSupply()
    const match = totalSupply.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77')
    assert(match, 'result is not correct')
  })

  // TRANSFERS
  // normal transfers without approvals
  it('transfers: ether transfer should be reversed.', async () => {
    const balanceBefore = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balanceBefore.toNumber(), 10000)

    web3.eth.sendTransaction({from: accounts[0], to: TOKEN.address, value: web3.toWei('10', 'Ether')}, async (err, res) => {
      expectThrow(new Promise((resolve, reject) => {
        if (err) reject(err)
        resolve(res)
      }))

      const balanceAfter = await TOKEN.balanceOf.call(accounts[0])
      assert.strictEqual(balanceAfter.toNumber(), 10000)
    })
  })

  it('transfers: should transfer 10000 to accounts[1] with accounts[0] having 10000', async () => {
    await TOKEN.transfer(accounts[1], 10000, {from: accounts[0]})
    const balance = await TOKEN.balanceOf.call(accounts[1])
    assert.strictEqual(balance.toNumber(), 10000)
    var source = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(source.toNumber(), 0)
  })

  it('transfers: should fail when trying to transfer 10001 to accounts[1] with accounts[0] having 10000', async () => {
    expectThrow(TOKEN.transfer.call(accounts[1], 10001, {from: accounts[0]}))
  })

  it('transfers: should handle zero-transfers normally', async () => {
    assert(await TOKEN.transfer.call(accounts[1], 0, {from: accounts[0]}), 'zero-transfer has failed')
  })

  // NOTE: testing uint256 wrapping is impossible in this standard token since you can't supply > 2^256 -1
  // todo: transfer max amounts

  // APPROVALS
  it('approvals: msg.sender should approve 100 to accounts[1]', async () => {
    await TOKEN.approve(accounts[1], 100, {from: accounts[0]})
    const allowance = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance.toNumber(), 100)
  })

  // bit overkill. But is for testing a bug
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 once.', async () => {
    const balance0 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance0.toNumber(), 10000)

    await TOKEN.approve(accounts[1], 100, {from: accounts[0]}) // 100
    const balance2 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance2.toNumber(), 0, 'balance1 not correct')

    await TOKEN.transferFrom.call(accounts[0], accounts[2], 20, {from: accounts[1]})
    await TOKEN.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]}) // -20
    const allowance01 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance01.toNumber(), 80) // =80

    const balance2b = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance2b.toNumber(), 20)

    const balance0b = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance0b.toNumber(), 9980)
  })

  // should approve 100 of msg.sender & withdraw 50, twice. (should succeed)
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 20 twice.', async () => {
    await TOKEN.approve(accounts[1], 100, {from: accounts[0]})
    const allowance01 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance01.toNumber(), 100)

    await TOKEN.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]})
    const allowance012 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance012.toNumber(), 80)

    const balance2 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance2.toNumber(), 20)

    const balance0 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance0.toNumber(), 9980)

    // FIRST tx done.
    // onto next.
    await TOKEN.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]})
    const allowance013 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance013.toNumber(), 60)

    const balance22 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance22.toNumber(), 40)

    const balance02 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance02.toNumber(), 9960)
  })

  // should approve 100 of msg.sender & withdraw 50 & 60 (should fail).
  it('approvals: msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', async () => {
    await TOKEN.approve(accounts[1], 100, {from: accounts[0]})
    const allowance01 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance01.toNumber(), 100)

    await TOKEN.transferFrom(accounts[0], accounts[2], 50, {from: accounts[1]})
    const allowance012 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.strictEqual(allowance012.toNumber(), 50)

    const balance2 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance2.toNumber(), 50)

    const balance0 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance0.toNumber(), 9950)

  // FIRST tx done.
  // onto next.
  expectThrow(TOKEN.transferFrom.call(accounts[0], accounts[2], 60, {from: accounts[1]}))
  })

  it('approvals: attempt withdrawal from account with no allowance (should fail)', () => {
    return expectThrow(TOKEN.transferFrom.call(accounts[0], accounts[2], 60, {from: accounts[1]}))
  })

  it('approvals: allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer.', async () => {
    await TOKEN.approve(accounts[1], 100, {from: accounts[0]})
    await TOKEN.transferFrom(accounts[0], accounts[2], 60, {from: accounts[1]})
    await TOKEN.approve(accounts[1], 0, {from: accounts[0]})
    expectThrow(TOKEN.transferFrom.call(accounts[0], accounts[2], 10, {from: accounts[1]}))
  })

  it('approvals: approve max (2^256 - 1)', async () => {
    await TOKEN.approve(accounts[1], '115792089237316195423570985008687907853269984665640564039457584007913129639935', {from: accounts[0]})
    const allowance = await TOKEN.allowance(accounts[0], accounts[1])
    assert(allowance.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77'))
  })

  // should approve max of msg.sender & withdraw 20 without changing allowance (should succeed).
  it('approvals: msg.sender approves accounts[1] of max (2^256 - 1) & withdraws 20', async () => {
    const balance0 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance0.toNumber(), 10000)

    const max = '1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77'
    await TOKEN.approve(accounts[1], max, {from: accounts[0]})
    const balance2 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance2.toNumber(), 0, 'balance2 not correct')

    await TOKEN.transferFrom(accounts[0], accounts[2], 20, {from: accounts[1]})
    const allowance01 = await TOKEN.allowance.call(accounts[0], accounts[1])
    assert.equal(allowance01.toNumber(), max)

    const balance22 = await TOKEN.balanceOf.call(accounts[2])
    assert.strictEqual(balance22.toNumber(), 20)

    const balance02 = await TOKEN.balanceOf.call(accounts[0])
    assert.strictEqual(balance02.toNumber(), 9980)
  })

  it('events: should fire Transfer event properly', async () => {
    const res = await TOKEN.transfer(accounts[1], '2666', {from: accounts[0]})
    const transferLog = res.logs.find(element => element.event.match('Transfer'))

    assert.strictEqual(transferLog.args.from, accounts[0])
    assert.strictEqual(transferLog.args.to, accounts[1])
    assert.strictEqual(transferLog.args.value.toString(), '2666')
  })

  it('events: should fire Transfer event normally on a zero transfer', async () => {
    const res = await TOKEN.transfer(accounts[1], '0', {from: accounts[0]})
    const transferLog = res.logs.find(element => element.event.match('Transfer'))
    assert.strictEqual(transferLog.args.from, accounts[0])
    assert.strictEqual(transferLog.args.to, accounts[1])
    assert.strictEqual(transferLog.args.value.toString(), '0')
  })

  it('events: should fire Approval event properly', async () => {
    const res = await TOKEN.approve(accounts[1], '2666', {from: accounts[0]})
    const approvalLog = res.logs.find(element => element.event.match('Approval'))
    assert.strictEqual(approvalLog.args.owner, accounts[0])
    assert.strictEqual(approvalLog.args.spender, accounts[1])
    assert.strictEqual(approvalLog.args.value.toString(), '2666')
  })
})