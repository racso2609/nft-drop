pragma solidity ^0.8.7;
import "./Nft.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NftDrop is Nft {
	using SafeMath for uint256;
	uint256 public totalDrops;
	uint256 constant MINT_PRICE = 0.01 ether;
	uint256 constant TAX_PORCENTAGE = 10;
	uint256 public balance;


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
  mapping(uint256=>uint256) public dropsBalance;
	mapping(uint256 => Drop) public drops;

	modifier mintValidator(uint256 _mintAmount, uint256 _dropId) {
		require(
			_mintAmount > 0 && _mintAmount <= drops[_dropId].maxMintPerTx,
			"Invalid mint amount!"
		);
		require(
			drops[_dropId].totalNft + _mintAmount <= drops[_dropId].maxSupply,
			"Max supply exceeded!"
		);
		_;
	}
	modifier onlyDropOwner(uint256 _dropId) {
		require(msg.sender == drops[_dropId].owner, "You are not the owner");
		_;
	}

	function _baseURI(uint256 _dropId)
		internal
		view
		virtual
		returns (string memory)
	{
		return drops[_dropId].prefix;
	}

	function tokenURI(uint256 _tokenId, uint256 _dropId)
		public
		view
		virtual
		returns (string memory)
	{
		require(
			_exists(_tokenId),
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
		string calldata _prefix,
		string calldata _sufix,
		string calldata _hiddenURI,
		uint256 _maxPerTx
	) external whenNotPaused returns (uint256) {
		Drop memory newDrop;
		newDrop.maxSupply = _maxSupply;
		newDrop.name = _name;
		newDrop.cid = _cid;
		newDrop.owner = msg.sender;
		newDrop.prefix = _prefix;
		newDrop.sufix = _sufix;
		newDrop.hiddenURI = _hiddenURI;
		newDrop.maxMintPerTx = _maxPerTx;
		drops[totalDrops] = newDrop;
		emit CreateDrop(totalDrops, _name);

		totalDrops++;
		return totalDrops - 1;
	}

	function mint(uint256 _dropId, uint256 _mintAmount)
		external
		payable
		mintValidator(_mintAmount, _dropId)
		whenNotPaused
	{
		require(msg.value >= _mintAmount.mul(MINT_PRICE), "Invalid eth amount!");

		uint256 tax = msg.value.mul(TAX_PORCENTAGE).div(100);
		_mintLoop(msg.sender, _mintAmount);
		drops[_dropId].totalNft += _mintAmount;
		dropsBalance[_dropId]+= msg.value.sub(tax);
		balance += tax;
	}

	function defineDrop(uint256 _dropId)
		external
		payable
		whenNotPaused
		onlyDropOwner(_dropId)
		returns (uint256)
	{
		drops[_dropId].revealed = true;
	}

	function withdrawDrop(uint256 _dropId) external onlyDropOwner(_dropId) {
		(bool os, ) = payable(drops[_dropId].owner).call{
			value: dropsBalance[_dropId]
		}("");
		require(os);
		dropsBalance[_dropId]= 0;

	}

	function withdrawOwner(uint256 _dropId) external onlyOwner {
		(bool os, ) = payable(owner()).call{ value: balance }("");
		require(os);
		balance = 0;
	}
}
