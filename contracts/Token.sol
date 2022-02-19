pragma solidity ^0.8.7;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20{

  constructor(uint256 _totalSupply) ERC20("RACToken","RAC") { 
    _mint(msg.sender,_totalSupply);
  }

}
