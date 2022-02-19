pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Nft is ERC721 {
	constructor() ERC721("Racso", "RAC") {}

	struct Nft {
		string fileHash;
		// string name;
	}

	mapping(uint256 => Nft) nfts;
	mapping(string => bool) existHash;
	uint256 totalNft;

	function mint(string calldata _fileHash) external {
		require(!existHash[_fileHash], "Hash already exist");
		_mint(msg.sender, totalNft);
		Nft memory newNft;
		newNft.fileHash = _fileHash;
		nfts[totalNft] = newNft;
		existHash[_fileHash] = true;
		totalNft++;
	}
}
