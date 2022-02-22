pragma solidity ^0.8.7;
import "./Nft.sol";

contract NftDrop is Nft {
	uint256 totalDrops;

	struct Offer {
		uint256 price;
		address owner;
	}

	struct Drop {
		uint256 duration;
		string name;
		uint256 hash;
		address owner;
		uint256 nftId;
		uint256 initialPrice;
		uint256 totalOffers;
		Offer higgestOffer;
		uint256 initialDate;
		uint256 maxSupply;
		string cid;
	}
	mapping(uint256 => Drop) public drops;
	event CreateDrop(uint256 indexed dropId, uint256 indexed duration);

	function _baseURI()
		internal
		view
		virtual
		override(ERC721)
		returns (string memory)
	{
		return "https://ipfs.io/ipfs/";
	}

	function tokenURI(uint256 tokenId, uint256 _dropId)
		public
		view
		virtual
		returns (string memory)
	{
		require(
			_exists(tokenId),
			"ERC721Metadata: URI query for nonexistent token"
		);

		string memory baseURI = _baseURI();
		return
			bytes(baseURI).length > 0
				? string(
					abi.encodePacked(
						baseURI,
						drops[_dropId].cid,
						"?filename=",
						nfts[tokenId],
						".jpg"
					)
				)
				: "";
	}

	function createDrop(
		uint256 _maxSupply,
		string calldata _name,
		string calldata _cid,
		uint256 _duration,
		uint256 _initialPrice
	) external onlyAdminAndMinters whenNotPaused returns (uint256) {
		Drop memory newDrop;
		newDrop.maxSupply = _maxSupply;
		newDrop.duration = _duration;
		newDrop.name = _name;
		newDrop.cid = _cid;
		newDrop.initialPrice = _initialPrice;
		newDrop.initialDate = block.timestamp;
		newDrop.owner = msg.sender;
		drops[totalDrops] = newDrop;
		emit CreateDrop(totalDrops, _duration);

		totalDrops++;
		return totalDrops - 1;
	}

	function makeOffer(uint256 _dropId, uint256 _price) external whenNotPaused {
		require(
			_price > drops[_dropId].initialPrice &&
				_price > drops[_dropId].higgestOffer.price,
			"Your offer should be bigger than the actual price"
		);
		require(
			block.timestamp < drops[_dropId].initialDate + drops[_dropId].duration,
			"This drop is finished"
		);
		drops[_dropId].higgestOffer.owner = msg.sender;
		drops[_dropId].higgestOffer.price = _price;
	}

	function random(uint256 maxLenght) private view returns (uint256) {
		return
			uint256(
				keccak256(
					abi.encodePacked(block.difficulty, block.timestamp, maxLenght)
				)
			) % maxLenght;
	}

	function defineDrop(uint256 _dropId)
		external
		payable
		whenNotPaused
		returns (uint256)
	{
		require(
			msg.sender == drops[_dropId].higgestOffer.owner,
			"You are not the owner"
		);
		require(
			block.timestamp > drops[_dropId].initialDate + drops[_dropId].duration,
			"Drop is not finished"
		);
		require(msg.value >= 0.1 ether, "Insufficient funds!");
		uint256 randomNum = random(drops[_dropId].maxSupply);
		drops[_dropId].hash = randomNum;
		uint256 nftId = createNft(randomNum);
		drops[_dropId].nftId = nftId;
		return nftId;
	}
}
