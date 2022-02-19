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
			initialPrice = 10;
			await nft.mint("123", "hola");
		});

		it("fail creating, a hash exist like a nft", async () => {
			await expect(
				drop.createDrop(
					[...hashesArray, "123"],
					dropName,
					duration,
					initialPrice
				)
			).to.be.revertedWith("hash already exist");
		});
		it("create drop", async () => {
			const tx = await drop.createDrop(
				hashesArray,
				dropName,
				duration,
				initialPrice
			);
			await printGas(tx);
			const dropId = Number(tx.value);
			const newDrop = await drop.drops(dropId);
			expect(newDrop.name).to.be.equal(dropName);
			expect(newDrop.duration).to.be.equal(duration);
			expect(newDrop.hash).to.be.equal("");
			expect(newDrop.initialPrice).to.be.equal(10);
		});

		it("event emmited", async () => {
			await expect(
				drop.createDrop(hashesArray, dropName, duration, initialPrice)
			)
				.to.emit(drop, "CreateDrop")
				.withArgs(0, duration);
		});
	});
	describe("make offers", () => {
		beforeEach(async () => {
			hashesArray = ["111", "222"];
			duration = 60 * 10;
			dropName = "first drop";
			await drop.createDrop(hashesArray, dropName, duration, 10);
		});
		it("fail offer are less than the initial price", async () => {
			await expect(drop.makeOffer(0, 9)).to.be.revertedWith(
				"Your offer should be bigger than the actual price"
			);
		});

		it("create offer", async () => {
			const tx = await drop.makeOffer(0, 11);
			await printGas(tx);
			const actualDrop = await drop.drops(0);
			expect(actualDrop.higgestOffer.owner).to.be.equal(deployer);
			expect(actualDrop.higgestOffer.price).to.be.equal(11);
		});

		it("fail offer less than the higgest offer", async () => {
			await drop.makeOffer(0, 11);
			await printGas(tx);
			await expect(drop.makeOffer(0, 11)).to.be.revertedWith(
				"Your offer should be bigger than the actual price"
			);
		});
	});
});
