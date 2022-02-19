const { expect } = require("chai");
const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");

describe("Nft", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());

		deployerSigner = await ethers.provider.getSigner(deployer);
		userSigner = await ethers.provider.getSigner(user);
		userNotRegisterSigner = await ethers.provider.getSigner(userNotRegister);

		// Deploy contracts
		Nft = await ethers.getContractFactory("Nft");
		nft = await Nft.deploy();
	});

	describe("Creation", () => {
		beforeEach(() => {
			hash = "123";
			name = "hola";
		});
		it("create succesfull", async () => {
			const tx = await nft.mint(hash, name);
			await printGas(tx);
			const nftId = Number(tx.value);
			const newNft = await nft.nfts(nftId);
			expect(newNft.fileHash).to.be.equal(hash);
			expect(newNft.name).to.be.equal("hola");
		});

		it("fail hash already exist", async () => {
			const tx = await nft.mint(hash, name);
			await printGas(tx);
			await expect(nft.mint(hash, name)).to.be.revertedWith(
				"Hash already exist"
			);
		});
	});
});
