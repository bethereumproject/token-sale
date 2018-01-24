pragma solidity ^0.4.18;

import '../installed_contracts/zeppelin/contracts/crowdsale/FinalizableCrowdsale.sol';

contract BTHRMTokenSale is FinalizableCrowdsale {
    using SafeMath for uint256;


    // Define sale /*IN DEVELOPMENT PHASE*/
    /*CODE IN DEVELOPMENT PHASE. ALL VALUES IN CONSTANTS ARE ONLY FOR TEST AND DEVELOPMENT PURPOSES. NOT CORRESPONDING WITH REAL VALUES*/
    uint public constant RATE = 12000;
    uint public constant TOKEN_SALE_LIMIT = 15000 * 1000000000000000000;

    uint public constant FIRST_BONUS_RATIO = 100000000 * (1 ether / 1 wei);// +40% bonus
    uint public constant SECOND_BONUS_RATIO = 200000000 * (1 ether / 1 wei);// + 20% bonus

    uint256 public constant TOKENS_FOR_OPERATIONS = 330000000*(10**18);
    uint256 public constant TOKENS_FOR_SALE = 670000000*(10**18);

    enum Phase {
        Created,//Inital phase after deploy
        PresaleRunning, //Presale phase
        Paused, //Pause phase between pre-sale and main token sale or emergency pause function
        ICORunning, //Main token-sale phase
        FinishingICO //Final phase when main token sale is closed and time is up
    }

    Phase public currentPhase = Phase.Created;
    
    event LogPhaseSwitch(Phase phase);

    // Constructor
    function BTHRMTokenSale(uint256 _end, address _wallet)
             FinalizableCrowdsale()
             Crowdsale(_end, _wallet) {
    }

    /// @dev Lets buy you some tokens.
    function buyTokens(address _buyer) public payable {
        // Available only if presale or ico is running.
        require((currentPhase == Phase.PresaleRunning) || (currentPhase == Phase.ICORunning));
        require(_buyer != address(0));
        require(msg.value > 0);
        require(validPurchase());

        uint256 weiAmount = msg.value;
        weiRaised = weiRaised.add(weiAmount);

        uint newTokens = msg.value * RATE;

        require(weiRaised <= TOKEN_SALE_LIMIT);

        newTokens = addBonusTokens(token.totalSupply(), newTokens);

        require(newTokens + weiRaised <= TOKENS_FOR_SALE);

        token.mint(_buyer, newTokens);
        TokenPurchase(msg.sender, _buyer, weiAmount, newTokens);

        forwardFunds();
    }

    // @dev Adds bonus tokens by token supply bought by user
    // @param _totalSupply total supply of token bought during pre-sale/ico
    // @param _newTokens tokens currently bought by user
    function addBonusTokens(uint256 _totalSupply, uint256 _newTokens) internal view returns (uint256) {
        /*IN DEVELOPMENT PHASE*/
        /*IN DEVELOPMENT PHASE*/
        /*IN DEVELOPMENT PHASE*/
    }

    function validPurchase() internal view returns (bool) {
        bool withinPeriod = now <= endTime;
        bool nonZeroPurchase = msg.value != 0;
        bool isRunning = ((currentPhase == Phase.ICORunning) || (currentPhase == Phase.PresaleRunning));
        return withinPeriod && nonZeroPurchase && isRunning;
    }

    function setSalePhase(Phase _nextPhase) public onlyOwner {
        bool canSwitchPhase
        =  (currentPhase == Phase.Created && _nextPhase == Phase.PresaleRunning)
        || (currentPhase == Phase.PresaleRunning && _nextPhase == Phase.Paused)
        || ((currentPhase == Phase.PresaleRunning || currentPhase == Phase.Paused)
        && _nextPhase == Phase.ICORunning)
        || (currentPhase == Phase.ICORunning && _nextPhase == Phase.Paused)
        || (currentPhase == Phase.Paused && _nextPhase == Phase.FinishingICO)
        || (currentPhase == Phase.ICORunning && _nextPhase == Phase.FinishingICO);

        require(canSwitchPhase);
        currentPhase = _nextPhase;
        LogPhaseSwitch(_nextPhase);
    }

    // Finalize
    function finalization() internal {
        uint256 toMint = TOKENS_FOR_OPERATIONS;
        token.mint(wallet, toMint);
        token.finishMinting();
        token.transferOwnership(wallet);
    }

    // Constant functions
    function getCurrentPhase() public view returns (string CurrentPhase) {
        if (currentPhase == Phase.Created) {
            return "Created";
        } else if (currentPhase == Phase.PresaleRunning) {
            return "PresaleRunning";
        } else if (currentPhase == Phase.Paused) {
            return "Paused";
        } else if (currentPhase == Phase.ICORunning) {
            return "ICORunning";
        } else if (currentPhase == Phase.FinishingICO) {
            return "FinishingICO";
        }
    }
}
