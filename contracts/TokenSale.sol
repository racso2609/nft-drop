pragma solidity ^0.8.0;
import './Token.sol';
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract TokenSale is Ownable{
  using SafeMath for uint256;
  Token public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold; 

  constructor(Token _tokenContract, uint256 _tokenPrice){
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }
  event Sell(
    address indexed buyer,
    uint256 indexed numberOfTokens
  );
  function buyTokens(uint256 _numberOfTokens) external payable{
    // Require that value is equal to tokens
    require(msg.value == _numberOfTokens.mul(tokenPrice),"wrong eth amount");
    
    // Require that the contract have enought tokens
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens,'cannot purchase more tokens than avaliable');
    // Require that a tranfer successfull
    require(tokenContract.transfer(msg.sender,_numberOfTokens));

    tokensSold += _numberOfTokens;
    
    emit Sell(msg.sender,_numberOfTokens);
   
  }

  function endSale()  external onlyOwner{
    require(tokenContract.transfer(owner(),tokenContract.balanceOf(address(this))));
    selfdestruct(payable(owner()));
  }
}
