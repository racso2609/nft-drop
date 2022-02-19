pragma solidity ^0.8.7;
import "./Nft.sol";

contract NftDrop {
	Nft nftContract;
	mapping(uint256 => Drop) public drops;
	uint256 totalDrops;

	struct Drop {
		string[] avaliableHashes;
		uint256 duration;
		string name;
		string hash;
		uint256 nftId;
	}

	constructor(Nft _nftContract) {
		nftContract = _nftContract;
	}

	function createDrop(
		string[] calldata _hashArray,
		string calldata _name,
		uint256 _duration
	) external returns(uint256){
		for (uint256 i = 0; i < _hashArray.length; i++) {
			require(!nftContract.existHash(_hashArray[i]), "hash already exist");
		}
		Drop memory newDrop;
		newDrop.avaliableHashes = _hashArray;
		newDrop.duration = _duration;
		newDrop.name = _name;
		drops[totalDrops] = newDrop;
		totalDrops++;
		return totalDrops - 1;
	}
}
