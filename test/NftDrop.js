const { expect } = require("chai");
const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");

describe("NftDrop", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());
		Nft = await ethers.getContractFactory("Nft");
		nft = await Nft.deploy();
		Drop = await ethers.getContractFactory("NftDrop");
		drop = await Drop.deploy(nft.address);
	});
	describe("Drop Creation", () => {
		beforeEach(async () => {
			hashesArray = ["111", "222"];
			duration = 60 * 10;
			dropName = "first drop";
			await nft.mint("123", "hola");
		});

		it("fail creating, a hash exist like a nft", async () => {
			await expect(
				drop.createDrop([...hashesArray, "123"], dropName, duration)
			).to.be.revertedWith("hash already exist");
		});
		it("create drop", async () => {
			const tx = await drop.createDrop(hashesArray, dropName, duration);
			await printGas(tx);
			const dropId = Number(tx.value);
			const newDrop = await drop.drops(dropId);
			expect(newDrop.name).to.be.equal(dropName);
			expect(newDrop.duration).to.be.equal(duration);
			expect(newDrop.hash).to.be.equal("");
		});
	});
});
