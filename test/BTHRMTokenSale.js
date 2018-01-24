var BigNumber = require('bignumber.js');

// Pull artifact
var BTHRMTokenSale = artifacts.require('BTHRMTokenSale');
var BTHRMToken = artifacts.require('BethereumToken');

// Expected values
// const MULTISIG = accounts[0]//'0x8f241a33e20a0a499d586c3bd1160dc5fdab4fd0';
const END_TIME = 200;

const RATE = 7400;
const TOKEN_SALE_LIMIT = 50000000000000000000000;

const FIRST_BONUS_RATIO = 100000000000000000000000000;
const SECOND_BONUS_RATIO = 200000000000000000000000000;

const TOKENS_FOR_OPERATIONS = 630000000000000000000000000;
const TOKENS_FOR_SALE = 370000000000000000000000000;

const PHASE = [
    'Created',
    'PresaleRunning',
    'Paused',
    'ICORunning',
    'FinishingICO'
];

var TOKEN_SALE, TOKEN;
const GAS_LIMIT = 200000;

contract('BTHRMTokenSale', function(accounts) {
  const MULTISIG = accounts[0];
  var contract;

  // beforeEach(function() {
  //   return BTHRMTokenSale.new(Math.round(Date.now()/1000)+1000, accounts[0])
  //     .then(function(instance) {
  //       contract = instance;
  //     });
  // });

  it("Should be set properly", function () {
      var owner, endTime, rate, limit, bonusFirst, bonusSecond, operations, forsale, sale;

      return BTHRMTokenSale.deployed().then(function (instance) {
          sale = instance;

          promises = [];
          promises.push(sale.owner.call().then(function (res) {
              owner = res;
          }));
          promises.push(sale.endTime.call().then(function (res) {
              endTime = res.toNumber();
          }));
          promises.push(sale.RATE.call().then(function (res) {
              rate = res.toNumber();
          }));
          promises.push(sale.TOKEN_SALE_LIMIT.call().then(function (res) {
              limit = res.toNumber();
          }));
          promises.push(sale.FIRST_BONUS_RATIO.call().then(function (res) {
              bonusFirst = res.toNumber();
          }));
          promises.push(sale.SECOND_BONUS_RATIO.call().then(function (res) {
              bonusSecond = res.toNumber();
          }));
          promises.push(sale.TOKENS_FOR_OPERATIONS.call().then(function (res) {
              operations = res.toNumber();
          }));
          promises.push(sale.TOKENS_FOR_SALE.call().then(function (res) {
              forsale = res.toNumber();
          }));
          return Promise.all(promises)
      }).then(function () {
          assert.equal(owner, MULTISIG, 'Unexpected contract owner');
          //TODO: set right ending time assert.equal(endTime, END_TIME, "Ending time is not as advertised");
          assert.equal(rate, RATE, 'Rate is not as advertised');
          assert.equal(limit, TOKEN_SALE_LIMIT, 'Sale limit is not as advertised');
          assert.equal(bonusFirst, FIRST_BONUS_RATIO, 'First bonus ratio is not as advertised');
          assert.equal(bonusSecond, SECOND_BONUS_RATIO, 'Second bonus ratio is not as advertised');
          assert.equal(operations, TOKENS_FOR_OPERATIONS, 'Token portion for operations is not as advertised');
          assert.equal(forsale, TOKENS_FOR_SALE, 'Token portion for the sale is not as advertised');
      });
  });

  it('Should have a token contract bound to it', function () {
      return BTHRMTokenSale.deployed().then(function (instance) {
          return instance.token.call()
      }).then(function (token) {
          TOKEN = BTHRMToken.at(token);
          var isSet;
          if (TOKEN === 0x0 || TOKEN === undefined) {isSet = false} else {isSet = true}
          assert.equal(isSet, true, 'The token contract was not created');
      })
  });

  it('Should accept any contribution', function () {
      var sale, token;
      const DECIMALS = 1000000000000000000;

      // Buys for 1 ETH
      const contributor1 = {
          address: accounts[1],
          investment: 1000000000000000000,
          shouldHave: 1000000000000000000*10360 //impossible to round
      };
      // Buys for 2 ETH
      const contributor2 = {
          address: accounts[2],
          investment: 2000000000000000000,
          shouldHave: 2000000000000000000*10360
      };
      // Buys tokens for 0.1 ETH
      const contributor3 = {
          address: accounts[3],
          investment: 100000000000000000,
          shouldHave: 100000000000000000*10360 //1036000000000000000000
      };
      // Buys tokens for 0.9 ETH
      const contributor4 = {
          address: accounts[4],
          investment: 900000000000000000,
          shouldHave: 900000000000000000*10360 //9324000000000000000000
      };
      // Buys tokens for a random value 0.523525232 ETH
      const contributor5 = {
          address: accounts[5],
          investment: 523525232000000000,
          shouldHave: 523525232000000000*10360 // 5423721403520000000000
      };
      // Buys tokens for a complement to 1 of the random value
      const contributor6 = {
          address: accounts[6],
          investment: 476474768000000000,
          shouldHave: 476474768000000000*10360 // 4936278596480000000000
      };
      const contributor7 = {
          address: accounts[7],
          investment: 9647509652509650000000,
          shouldHave: new BigNumber(9647509652509650000000).times(10360).toNumber()
      };
      const contributor8 = {
          address: accounts[8],
          investment: 5630630630630630000000,
          shouldHave: new BigNumber(5630630630630630000000).times(8880).toNumber()
      };
      const contributor9 = {
          address: accounts[9],
          investment: 5630630630630630000000,
          shouldHave: new BigNumber(5630630630630630000000).times(8880).toNumber()
      };
      const contributor10 = {
          address: accounts[9],
          investment: 12285012285012300000000,
          shouldHave: new BigNumber(12285012285012300000000).times(8140).toNumber() + contributor9.shouldHave
      };
      const contributor11 = {
          address: accounts[11],
          investment: 9459459459459460000000,
          shouldHave: new BigNumber(9459459459459460000000).times(8140).toNumber()
      };

      return BTHRMTokenSale.deployed().then(function (instance) {
          sale = instance;
          return sale.setSalePhase(1, {from: accounts[0]})
      }).then(function() {
          return sale.token.call()
      }).then(function(address) {
          token = BTHRMToken.at(address);
          return sale.sendTransaction({from: contributor1.address, value: contributor1.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor1.address)
      }).then(function (balance) {
          contributor1.has = balance.toNumber();
          return sale.sendTransaction({from: contributor2.address, value: contributor2.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor2.address)
      }).then(function (balance) {
          contributor2.has = balance.toNumber();
          return sale.sendTransaction({from: contributor3.address, value: contributor3.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor3.address)
      }).then(function (balance) {
          contributor3.has = balance.toNumber();
          return sale.sendTransaction({from: contributor4.address, value: contributor4.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor4.address)
      }).then(function (balance) {
          contributor4.has = balance.toNumber();
          return sale.sendTransaction({from: contributor5.address, value: contributor5.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor5.address)
      }).then(function (balance) {
          contributor5.has = balance.toNumber();
          return sale.sendTransaction({from: contributor6.address, value: contributor6.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor6.address)
      }).then(function (balance) {
          contributor6.has = balance.toNumber();
          return sale.sendTransaction({from: contributor7.address, value: contributor7.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor7.address)
      }).then(function (balance) {
          contributor7.has = balance.toNumber();
          return sale.sendTransaction({from: contributor8.address, value: contributor8.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor8.address)
      }).then(function (balance) {
          contributor8.has = balance.toNumber();
          return sale.sendTransaction({from: contributor9.address, value: contributor9.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor9.address)
      }).then(function (balance) {
          contributor9.has = balance.toNumber();
          return sale.sendTransaction({from: contributor10.address, value: contributor10.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor10.address)
      }).then(function (balance) {
          contributor10.has = balance.toNumber();
          return sale.setSalePhase(2, {from: accounts[0]})
      }).then(function() {
          return sale.sendTransaction({from: contributor11.address, value: contributor11.investment, gas: GAS_LIMIT})
      }).then(function(response) {
          assert.isTrue(true, 'Expected throw not received');
      }).catch(function(error) {
          return sale.setSalePhase(3, {from: accounts[0]})
      }).then(function() {
          return sale.sendTransaction({from: contributor11.address, value: contributor11.investment, gas: GAS_LIMIT})
      }).then(function(){
          return token.balanceOf(contributor11.address)
      }).then(function (balance) {
          contributor11.has = balance.toNumber();

          assert.equal(contributor1.has, contributor1.shouldHave, 'The contributor 1 does not have the right token balance');
          assert.equal(contributor2.has, contributor2.shouldHave, 'The contributor 2 does not have the right token balance');
          assert.equal(contributor3.has, contributor3.shouldHave, 'The contributor 3 does not have the right token balance');
          assert.equal(contributor4.has, contributor4.shouldHave, 'The contributor 4 does not have the right token balance');
          assert.equal(contributor5.has, contributor5.shouldHave, 'The contributor 5 does not have the right token balance');
          assert.equal(contributor6.has, contributor6.shouldHave, 'The contributor 6 does not have the right token balance');
          assert.equal(contributor7.has, contributor7.shouldHave, 'The contributor 7 does not have the right token balance');
          assert.equal(contributor8.has, contributor8.shouldHave, 'The contributor 8 does not have the right token balance');
          assert.equal(contributor9.has, contributor9.shouldHave, 'The contributor 9 does not have the right token balance');
          assert.equal(contributor10.has, contributor10.shouldHave, 'The contributor 10 does not have the right token balance');
          assert.equal(contributor11.has, contributor11.shouldHave, 'The contributor 11 does not have the right token balance');
      })
  });
});

contract('BTHRMTokenSale', function(accounts) {
  it('Should accept any contribution below 50000 eth cap', function () {
    var sale, token;
    const contributor1 = {
      address: accounts[1],
      investment: 49999999999999999999999,
    };

    return BTHRMTokenSale.deployed().then(function (instance) {
      sale = instance;
      return sale.setSalePhase(1, {from: accounts[0]})
    }).then(function() {
      return sale.token.call()
    }).then(function(address) {
      token = BTHRMToken.at(address);
      return sale.sendTransaction({from: contributor1.address, value: contributor1.investment, gas: GAS_LIMIT})
    }).then(function(){
      assert.isTrue(true,'Good, Should have passed')
    }).catch(function(error) {
      assert(error != '', 'Contribution below 50000 was declined');
    })
  });
});

contract('BTHRMTokenSale', function(accounts) {
  it('Should accept a contribution of exactly 50000 eth', function () {
    var sale, token;
    const contributor1 = {
      address: accounts[1],
      investment: 50000000000000000000000,
    };

    return BTHRMTokenSale.deployed().then(function (instance) {
      sale = instance;
      return sale.setSalePhase(1, {from: accounts[0]})
    }).then(function() {
      return sale.token.call()
    }).then(function(address) {
      token = BTHRMToken.at(address);
      return sale.sendTransaction({from: contributor1.address, value: contributor1.investment, gas: GAS_LIMIT})
    }).then(function(){
      assert.isTrue(true,'Good, should have passed')
    }).catch(function(error) {
      assert(error == '', 'Contribution of exactly 50000 eth was declined');
    })
  });
});

contract('BTHRMTokenSale', function(accounts) {
  it('Should not accept any contribution above the 50000 cap', function () {
    var sale, token;
    const contributor1 = {
      address: accounts[1],
      investment: 50000000000000000000001,
      shouldHave: 0
    };

    return BTHRMTokenSale.deployed().then(function (instance) {
      sale = instance;

      return sale.setSalePhase(1, {from: accounts[0]})
    }).then(function () {
      return sale.token.call()
    }).then(function (address) {
      token = BTHRMToken.at(address);
      return sale.sendTransaction({from: contributor1.address, value: contributor1.investment, gas: GAS_LIMIT})
    }).then(function () {
      assert.isTrue(false, 'Contribution above 50000 eth was not declined');
    }).catch(function (error) {
      assert(error != '', 'Contribution of exactly 50000 eth was declined');
    })
  });
});

contract('BTHRMTokenSale', function(accounts) {
  it('Should not create more than 370,000,000 tokens', function () {
    var sale, token;
    const MAX_SUPPLY = new BigNumber(370000000).times(1000000000000000000);

    const contributor1 = {
      address: accounts[1],
      // investment: new BigNumber(100000000).div(10360).times(1000000000000000000),
      investment: new BigNumber(96525).times(100000000000000000),
      shouldHave: new BigNumber(96525).times(100000000000000000).times(10360),
    };
    const contributor2 = {
      address: accounts[2],
      // investment: new BigNumber(100000000).div(8880).times(1000000000000000000),
      investment: new BigNumber(1126126).times(10000000000000000),
      shouldHave: new BigNumber(1126126).times(10000000000000000).times(8880),
    };
    const contributor3 = {
      address: accounts[3],
      investment: new BigNumber(29086).times(1000000000000000000),
      shouldHave: new BigNumber(29086).times(1000000000000000000).times(8140),
    };

    return BTHRMTokenSale.deployed().then(function (instance) {
      sale = instance;
      return sale.token.call()
    }).then(function(address) {
      token = BTHRMToken.at(address);
      return sale.setSalePhase(1, {from: accounts[0]})
    }).then(function(){
      return sale.sendTransaction({from: contributor1.address, value: contributor1.investment.toNumber(), gas: GAS_LIMIT})
    }).then(function(){
      return token.balanceOf(contributor1.address)
    }).then(function (balance) {
      contributor1.has = balance.toNumber();
      return sale.sendTransaction({from: contributor2.address, value: contributor2.investment.toNumber(), gas: GAS_LIMIT})
    }).then(function(){
      return token.balanceOf(contributor2.address)
    }).then(function (balance) {
      contributor2.has = balance.toNumber();
      return sale.sendTransaction({from: contributor3.address, value: contributor3.investment.toNumber(), gas: GAS_LIMIT})
    }).then(function(){
      return token.balanceOf(contributor3.address)
    }).then(function (balance) {
      contributor3.has = balance.toNumber();

      assert.equal(contributor1.has, contributor1.shouldHave.toNumber(), 'The contributor 1 does not have the right token balance');
      assert.equal(contributor2.has, contributor2.shouldHave.toNumber(), 'The contributor 2 does not have the right token balance');
      assert.equal(contributor3.has, contributor3.shouldHave.toNumber(), 'The contributor 3 does not have the right token balance');

      return token.totalSupply.call()
    }).then(function(_supply) {
      assert((_supply.toNumber() <= MAX_SUPPLY.toNumber()), 'The total supply of tokens is larger than the expected upper bound');
    })
  });
});


// contract('BTHRMToken', function(accounts) {
//     const MULTISIG = accounts[0];
//     var token;
//
//     it('Should not allow minting above the limit', function () {
//         return BTHRMTokenSale.deployed().then(function (instance) {
//             token = instance;
//         }).then(function(){
//             return token.mint(10000000000000000000000000000)
//         }).then(function(){
//             return token.mint(1)
//         }).catch(function (error) {
//             assert.isTrue(true, 'Minting above raised an issue');
//             return token.totalSupply.call()
//         }).then(function(){
//             return token.totalSupply.call()
//         }).then(function(totalSupply) {
//             assert.equal(totalSupply, 10000000000000000000000000000, 'Allowed mining above the 1 billion')
//         })
//     });
//
// })
//     it('Should not accept contributions after ending', function () {
//         return BTHRMTokenSale.deployed().then(function (instance) {
//         })
//     });
// });