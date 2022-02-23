pragma solidity ^0.8.7;
import "./Nft.sol";

contract Drop is Nft {
	Token public tokenContract;
	uint256 duration;
	uint256 startTime;
	uint256 startOn;

	modifier isValidTimeToMint() {
		require(
			block.timestamp > startTime + startOn || hasRole(MINTER_ROLE, msg.sender),
			"Mint does not start!"
		);
		_;
	}

	modifier isDropFinished() {
		require(
			maxSupply == totalNft || block.timestamp > startTime + duration + startOn, "This drop is not finished!"
		);
		_;
	}
    modifier isDropNotFinished() {
		require(
			maxSupply > totalNft && block.timestamp < startTime + duration + startOn, "This drop is finished!"
		);
		_;
	}

	constructor(
		Token _tokenContract,
		uint256 _duration,
		uint256 _startOn
	) Nft() {
		tokenContract = _tokenContract;
		duration = _duration;
		startTime = block.timestamp;
		startOn = _startOn;
	}

	function defineDrop() external isDropFinished onlyOwner whenNotPaused {
		setRevealed(true);
	}

	function mint(uint256 _mintAmount)
		public
		whenNotPaused
		mintValidator(_mintAmount)
		isDropNotFinished
		isValidTimeToMint
	{
        require(tokenContract.transferFrom(msg.sender, address(this), price * _mintAmount));
		_mintLoop(msg.sender, _mintAmount);
	}
}
