pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../Token.sol";

contract Nft is ERC721Pausable, ERC721Burnable, AccessControl,Ownable {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	bytes32 public constant PAUSABLE_ROLE = keccak256("PAUSABLE_ROLE");
	using Strings for uint256;


	string public uriPrefix = "";
	string public uriSuffix = ".json";
	string public hiddenMetadataUri;

	uint256 public price = 0.01 ether;
	uint256 public maxSupply = 5;
	uint256 public maxMintPerTx = 5;

	uint256 public totalNft;
	bool public revealed = false;

	modifier mintValidator(uint256 _mintAmount) {
		require(
			_mintAmount > 0 && _mintAmount <= maxMintPerTx,
			"Invalid mint amount!"
		);
		require(totalNft + _mintAmount <= maxSupply, "Max supply exceeded!");
		_;
	}
	modifier onlyAdmin() {
		require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "You are not an admin");
		_;
	}

	modifier onlyPausable() {
		require(hasRole(PAUSABLE_ROLE, msg.sender), "You are not an admin");
		_;
	}

	modifier onlyAdminAndMinters() {
		require(
			hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
				hasRole(MINTER_ROLE, msg.sender),
			"You are not an admin or a minter"
		);
		_;
	}


	

	constructor() ERC721("Racso", "RAC") {
		_setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_setupRole(MINTER_ROLE, msg.sender);
		_setupRole(PAUSABLE_ROLE, msg.sender);
		setHiddenMetadataUri(
			"ipfs://QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6/hidden.json"
		);
		setUriPrefix(
			"ipfs://QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6/"
		);
	}

	function _baseURI() internal view virtual override returns (string memory) {
		return uriPrefix;
	}

	function tokenURI(uint256 _tokenId)
		public
		view
		virtual
		override
		returns (string memory)
	{
		require(
			_exists(_tokenId),
			"ERC721Metadata: URI query for nonexistent token"
		);

		if (revealed == false) {
			return hiddenMetadataUri;
		}

		string memory currentBaseURI = _baseURI();
		return
			bytes(currentBaseURI).length > 0
				? string(
					abi.encodePacked(currentBaseURI, _tokenId.toString(), uriSuffix)
				)
				: "";
	}

	function supportsInterface(bytes4 interfaceId)
		public
		view
		virtual
		override(AccessControl, ERC721)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}

	function pause() external onlyPausable {
		_pause();
	}

	function unpause() external onlyPausable {
		_unpause();
	}

	function setPrice(uint256 _price) public onlyOwner {
		price = _price;
	}

	function setMaxMintPerTx(uint256 _maxMintPerTx) public onlyOwner {
		maxMintPerTx = _maxMintPerTx;
	}

	function setHiddenMetadataUri(string memory _hiddenMetadataUri)
		public
		onlyOwner
	{
		hiddenMetadataUri = _hiddenMetadataUri;
	}

	function setUriPrefix(string memory _uriPrefix) public onlyOwner {
		uriPrefix = _uriPrefix;
	}

	function setUriSuffix(string memory _uriSuffix) public onlyOwner {
		uriSuffix = _uriSuffix;
	}
	function setRevealed(bool _state) public onlyOwner {
		revealed = _state;
	}

	function withdraw() public onlyOwner {	
		(bool os, ) = payable(owner()).call{ value: address(this).balance }("");
		require(os);
	}
	/**
	 * override(ERC721, ERC721Enumerable, ERC721Pausable)
	 * here you're overriding _beforeTokenTransfer method of
	 * three Base classes namely ERC721, ERC721Enumerable, ERC721Pausable
	 * */
	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId
	) internal override(ERC721, ERC721Pausable) {
		super._beforeTokenTransfer(from, to, tokenId);
	}

	function _mintLoop(address _minter, uint256 _mintAmount) internal {
		for (uint256 i = 0; i < _mintAmount; i++) {
			totalNft++;
			_safeMint(_minter, totalNft);
		}
	}

	
}
