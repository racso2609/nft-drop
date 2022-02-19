pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nft is ERC721 {
	constructor() ERC721("Racso", "RAC") {}

	struct Nft {
		string fileHash;
		string name;
	}

	mapping(uint256 => Nft) public nfts;
	mapping(string => bool) existHash;
	uint256 totalNft;

	function mint(string calldata _fileHash,string calldata _name) external returns(uint256){
		require(!existHash[_fileHash], "Hash already exist");
		_mint(msg.sender, totalNft);
		Nft memory newNft;
		newNft.fileHash = _fileHash;
		newNft.name = _name;
		nfts[totalNft] = newNft;
		existHash[_fileHash] = true;
		totalNft++;
		return totalNft - 1;
	}
}
