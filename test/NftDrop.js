const { expect } = require("chai");
// const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");
const { increaseTime } = require("../utils/transactions.js");

describe("NftDrop", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());
		userSigner = await ethers.provider.getSigner(user);

		// drop = await ethers.getContractFactory("Nft");
		// drop = await Nft.deploy();

		Drop = await ethers.getContractFactory("NftDrop");
		drop = await Drop.deploy();
		duration = 60 * 10;
		cid = "QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6";
		prefix = "ipfs://";
		sufix = ".json";
    hiddenURI = prefix + cid + "hidden" + sufix;
	});
	describe("basic functions", () => {
		it("pause contract", async () => {
			await drop.pause();
			const isPaused = drop.paused();
			expect(isPaused);
		});
		it("unpause contract", async () => {
			await drop.pause();
			await drop.unpause();
			const isPaused = drop.paused();
			expect(!isPaused);
		});
	});
	describe("Drop Creation", () => {
		beforeEach(async () => {
			maxSupply = 5;
			duration = 60 * 10;
			dropName = "first drop";
		});

		it("create drop", async () => {
			const tx = await drop.createDrop(
				maxSupply,
				dropName,
				cid,
				duration,
				prefix,
				sufix,
        hiddenURI
			);
			await printGas(tx);
			const dropId = Number(tx.value);
			const newDrop = await drop.drops(dropId);
			expect(newDrop.name).to.be.equal(dropName);
			expect(newDrop.duration).to.be.equal(duration);
			expect(newDrop.hash).to.be.equal(0);
			expect(newDrop.prefix).to.be.equal(prefix);
			expect(newDrop.sufix).to.be.equal(sufix);
		});

		it("event emmited", async () => {
			await expect(
				drop.createDrop(
					maxSupply,
					dropName,
					cid,
					duration,
					prefix,
          sufix,
          hiddenURI
				)
			)
				.to.emit(drop, "CreateDrop")
				.withArgs(0, duration);
		});
	});
//	describe("make offers", () => {
//		beforeEach(async () => {
//			maxSuply = 5;
//			duration = 60 * 10;
//			dropName = "first drop";
//			await drop.createDrop(
//				maxSupply,
//				dropName,
//				cid,
//				duration,
//				prefix,
//        sufix,
//        hiddenURI
//			);
//		});
//		it("fail offer are less than the initial price", async () => {
//			await expect(drop.makeOffer(0, 9)).to.be.revertedWith(
//				"Your offer should be bigger than the actual price"
//			);
//		});
//
//		it("create offer", async () => {
//			const tx = await drop.makeOffer(0, 11);
//			await printGas(tx);
//			const actualDrop = await drop.drops(0);
//			expect(actualDrop.higgestOffer.owner).to.be.equal(deployer);
//			expect(actualDrop.higgestOffer.price).to.be.equal(11);
//		});
//
//		it("fail offer less than the higgest offer", async () => {
//			await drop.makeOffer(0, 11);
//			await expect(drop.makeOffer(0, 11)).to.be.revertedWith(
//				"Your offer should be bigger than the actual price"
//			);
//		});
//
//		it("fail offer ended", async () => {
//			increaseTime(duration);
//			await expect(drop.makeOffer(0, 11)).to.be.revertedWith(
//				"This drop is finished"
//			);
//		});
//	});
	describe("define drop", () => {
		beforeEach(async () => {
			maxSupply = 5;
			duration = 60 * 10;
			dropName = "first drop";
			initialPrice = 10;
			await drop.createDrop(
				maxSupply,
				dropName,
				cid,
				duration,
				prefix,
        sufix,
        hiddenURI
			);
			await drop.connect(userSigner).makeOffer(0, 11);
		});

		it("fail drop does not finished", async () => {
			await expect(drop.connect(userSigner).defineDrop(0)).to.be.revertedWith(
				"Drop is not finished"
			);
		});
		it("fail you are not the drop owner", async () => {
			await expect(drop.defineDrop(0)).to.be.revertedWith(
				"You are not the owner"
			);
		});
		it("define drop", async () => {
			increaseTime(duration + 60);
			const tx = await drop.connect(userSigner).defineDrop(0, {
				value: ethers.utils.parseEther("0.1"),
			});
			await printGas(tx);
			const tokenId = tx.value;
			const definedDrop = await drop.drops(0);
			expect(maxSupply).to.be.gt(definedDrop.hash);
			const nft = await drop.nfts(tokenId);
			expect(maxSupply).to.be.gt(nft);
			const balanceOf = await drop.balanceOf(user);
			expect(balanceOf).to.be.eq(1);
		});
	});
});
