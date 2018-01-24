const TokenManager = artifacts.require("./TokenManager.sol");
const PresaleToken = artifacts.require("./PresaleToken.sol");


module.exports = (deployer, network) => {

  let team;

  if (network === "development") {
    team =
      [ "0xEe359a89adEb0AcCb3C417E7EFFDe1385dCB91b1"
      , "0x0c9f719DCB5c4BF62bb44CF0A75b12db397fBfE4"
      , "0x536220Ad2a60f6Dba7B0bd9468aEB10940e41e6a"
      ];


    // send some ether to the team
    team.forEach(addr => web3.eth.sendTransaction({
      from: web3.eth.accounts[9],
      to: addr,
      value: web3.toWei(20, 'ether')
    }));

  }
  else if (network === "ropsten") {
    team =
      [ "0x53BcaD810ABdBEbc305530EC86BB942fb6043c8C"
      , "0xEe359a89adEb0AcCb3C417E7EFFDe1385dCB91b1"
      , "0x0c9f719DCB5c4BF62bb44CF0A75b12db397fBfE4"
      ];

  }
  else if (network === "kovan") {
    team =
      [ "0x536220Ad2a60f6Dba7B0bd9468aEB10940e41e6a"
      , "0x53BcaD810ABdBEbc305530EC86BB942fb6043c8C"
      , "0xEe359a89adEb0AcCb3C417E7EFFDe1385dCB91b1"
      ];
  }
  else if (network === "mainnet") {
    team =
      [ "0x0c9f719DCB5c4BF62bb44CF0A75b12db397fBfE4"
      , "0x536220Ad2a60f6Dba7B0bd9468aEB10940e41e6a"
      ];
  }
  const requiredConfirmations = 2;
  const escrow = "0x53BcaD810ABdBEbc305530EC86BB942fb6043c8C";

  deployer.deploy(TokenManager, team, requiredConfirmations)
    .then(TokenManager.deployed)
    .then(tokenMgr => deployer.deploy(PresaleToken, tokenMgr.address, escrow));
};
