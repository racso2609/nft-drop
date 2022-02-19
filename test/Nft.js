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
		await fixture(["Nft"]);
		nft = await ethers.getContract("Nft");
	});

	describe("Creation", () => {
		beforeEach(() => {
			hash = "123";
		});
		it("create succesfull", async () => {
			const tx = await nft.mint(hash);
			await printGas();
			tx.wait();
			const nftId = Number(tx.value);
			const nft = await nft.nfts(nftId);
			expect(nft.fileHash).to.be.equal(hash);
		});

		it("fail hash already exist", async () => {
			const tx = await nft.mint(hash);
			await printGas(tx);
			tx.wait();
			await expect(nft.mint(hash)).to.be.revertedWith("Hash already exist");
		});
	});
});
