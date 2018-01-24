pragma solidity ^0.4.18;

import '../installed_contracts/zeppelin/contracts/token/MintableToken.sol';
import '../installed_contracts/zeppelin/contracts/token/PausableToken.sol';
/*CODE IN DEVELOPMENT PHASE. ALL VALUES IN CONSTANTS ARE ONLY FOR TEST AND DEVELOPMENT PURPOSES. NOT CORRESPONDING WITH REAL VALUES*/
contract BethereumToken is MintableToken, PausableToken {
    string public constant name = "Bethereum Token";
    string public constant symbol = "BTT";
    uint256 public constant decimals = 18;

    function BethereumToken(){
        pause();
    }

}