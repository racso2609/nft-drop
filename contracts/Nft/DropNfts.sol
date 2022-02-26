pragma solidity ^0.8.7;
import "./Nft.sol";

contract NftDrop is Nft {
	uint256 totalDrops;

	struct Drop {
		string name;
		uint256 hash;
		address owner;
		uint256 nftId;
		uint256 maxSupply;
		string cid;
		string prefix;
		string sufix;
    bool revealed;   
    string hiddenURI;   
    uint256 totalNft;
    uint256 maxMintPerTx;
      
	}
	mapping(uint256 => Drop) public drops;
	event CreateDrop(uint256 indexed dropId, uint256 indexed duration);
  
  modifier mintValidator(uint256 _mintAmount,uint256 _dropId) {
		require(
			_mintAmount > 0 && _mintAmount <= drops[_dropId].maxMintPerTx,
			"Invalid mint amount!"
		);
		require(drops[_dropId].totalNft + _mintAmount <= drops[_dropId].maxSupply, "Max supply exceeded!");
		_;
	}

	function _baseURI(uint256 _dropId)
		internal
		view
		virtual
		override(ERC721)
		returns (string memory)
	{
		return drops[dropId].prefix;
	}

	function tokenURI(uint256 _tokenId, uint256 _dropId)
		public
		view
		virtual
		returns (string memory)
	{
		require(
			_exists(tokenId),
			"ERC721Metadata: URI query for nonexistent token"
		);
    if (drops[_dropId].revealed) {

			return drops[_dropId].hiddenURI;
		}

		string memory baseURI = _baseURI();
		return
			bytes(baseURI).length > 0
				? string(
					abi.encodePacked(
						baseURI,
						drops[_dropId].cid,
						_tokenId,
						drops[_tokenId].sufix
					)
				)
				: "";
	}

	function createDrop(
		uint256 _maxSupply,
		string calldata _name,
		string calldata _cid,
		uint256 _duration,
		string calldata _prefix,
		string calldata _sufix,
		string calldata _hiddenURI,

	) external onlyAdminAndMinters whenNotPaused returns (uint256) {
		Drop memory newDrop;
		newDrop.maxSupply = _maxSupply;
		newDrop.name = _name;
		newDrop.cid = _cid;
		newDrop.owner = msg.sender;
		newDrop.prefix = _prefix;
		newDrop.sufix = _sufix;
		newDrop.hiddenURI = _hiddenURI;
		drops[totalDrops] = newDrop;
		emit CreateDrop(totalDrops, _duration);

		totalDrops++;
		return totalDrops - 1;
	}

	function mint(uint256 _dropId, uint256 _mintAmont) external minValidator(_mintAmount,_dropId) whenNotPaused {
		
    require()
    _mintLoop(msg.sender,_mintAmont)
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

	}
}
