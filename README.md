BTHR Bethereum Token Sale Contracts
===================================

- Hardcap for the token sale is 25 000ETH
- Total amount of the BTHR tokens created is 1 000 000 000, where:
  - 60% allocated for the token sale
  - 20% allocated for team and advisors
  - 12% allocated for the long term budget
  - 5% allocated for token sale costs
  - 3% allocated for the bounty, referrals and Air drop

**1. Phase - Created**

- After deploying contracts on the network, phase is automatically set to Created;
- Team is only able to run function "setSalePhase();" to set phase to "PresaleRunning";
- Amount of the tokens allocated for the sale is 600 000 000 tokens, at a basic rate of 17500 tokens per 1 ETH;

**2. Phase - Presale**

- Official pre-sale started, team is able to run "setSalePhase()" function to set phase to "PresaleRunning";
- Goal for the pre-sale is to rise 12 000ETH, where all unsold tokens from pre-sale phase are moved to "CrowdsaleRunning" phase;
- Smart contract is able to receive funds from contributors and funds are forwarded on team wallet address;
- Contributors will automatically receive tokens with 50% bonus;
- Total number of allocated tokens (incl. bonus) for this phase is calculated as 17500 \* 12000 \* 1,5, which is equals 315 000 000 tokens;
- Transfers and manipulation with token is blocked to the phase of "FinishingCrowdsale";

**3. Phase - Paused**

- Team is able to pause the receiving of the funds on the smart contract;
- In this phase, no one is able to buy the tokens;

**4. Phase - CrowdsaleRunning**

- Official token-sale started, team is able to run "setSalePhase()" function to set phase to "CrowdsaleRunning";
- Phase "CrowdsaleRunning" is divided into the three bonus stages;
  - First bonus stage, with 30% bonus, has allocated an amount of 147 875 000 tokens (incl. bonus); Unsold tokens from pre-sale phase will be added to first bonus stage and sold only in this phase (with 30% bonus);
  - In the second bonus stage, there is allocated amount of 110 687 500 tokens (incl. bonus) and contributors will receive tokens with 15% bonus;
  - In the third bonus stage, there is allocated amount of 17 500 000 tokens and contributors will not receive a bonus;
- Smart contract is able to receive the funds from contributors and funds are forwarded on team wallet address;
- Contributors will automatically receive tokens with corresponding bonus;
- Transfers and manipulation with the token is blocked to the phase of "FinishingCrowdsale";

**5. Phase - FinishingCrowdsale**

- Official token sale is finished, all tokens are sold or token sale reached time deadline;
- Tokens allocated for the long term budget, team and advisors are sent to the vesting smart contracts;
- Tokens allocated for bounty, referral, Air drop and token sale costs will be released immediately after finishing the token sale;
- Tokens from pre-sale and crowdsale are unpaused (manually) so contributors are able to manipulate with them;
- Unsold or unallocated tokens are burned;

**6. Phase - Vesting**

- After finishing crowdsale, vesting smart contract receives tokens allocated for long term budget, team and advisors
- Tokens distributed to core team members will be subject to vesting, in 20% increments over a period of 72 weeks commencing at the end of the token sale.
- Vesting will be handled by different smart contract