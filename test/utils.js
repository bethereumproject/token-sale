/**
 * Source: /**
 * Source: https://github.com/ConsenSys/Tokens/blob/master/test/eip20/eip20.js
 */

module.exports = {
    expectThrow: async promise => {
    const errMsg = 'Expected throw not received'
    try {
      await promise
    } catch (err) {
      assert(err.toString() != '', errMsg)
      return
    }
    assert.fail(errMsg)
}
}