pragma solidity ^0.8.7;
import "./Nft.sol";

contract NftDrop {
	Nft nftContract;
	mapping(uint256 => Drop) public drops;
	uint256 totalDrops;

	struct Offer {
		uint256 price;
		address owner;
	}

	struct Drop {
		string[] avaliableHashes;
		uint256 duration;
		string name;
		string hash;
		uint256 nftId;
		uint256 initialPrice;
		Offer higgestOffer;
	}
	event CreateDrop(uint256 indexed dropId, uint256 indexed duration);

	constructor(Nft _nftContract) {
		nftContract = _nftContract;
	}

	function createDrop(
		string[] calldata _hashArray,
		string calldata _name,
		uint256 _duration
	) external returns (uint256) {
		for (uint256 i = 0; i < _hashArray.length; i++) {
			require(!nftContract.existHash(_hashArray[i]), "hash already exist");
		}
		Drop memory newDrop;
		newDrop.avaliableHashes = _hashArray;
		newDrop.duration = _duration;
		newDrop.name = _name;
		drops[totalDrops] = newDrop;
		emit CreateDrop(totalDrops, _duration);

		totalDrops++;
		return totalDrops - 1;
	}
}
