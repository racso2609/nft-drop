pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Nft is ERC721Pausable, ERC721Burnable, AccessControl {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	bytes32 public constant PAUSABLE_ROLE = keccak256("PAUSABLE_ROLE");

	uint256 totalNft;
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
	}

	function supportsInterface(bytes4 interfaceId)
		public
		view
		virtual
		override(AccessControl,ERC721)
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
