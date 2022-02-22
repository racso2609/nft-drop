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
			hash = 1;
		});

		it("fail does not send ether", async () => {
			await expect(nft.mint(hash)).to.be.revertedWith("Insufficient funds!");
		});
		it("create succesfull", async () => {
			const tx = await nft.mint(hash, {
				value: ethers.utils.parseEther("0.1"),
			});
			await printGas(tx);
			const newNft = await nft.nfts(0);
			expect(newNft).to.be.equal(hash);
		});
	});
});
