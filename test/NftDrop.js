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
		cid = "QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6";
		prefix = "ipfs://";
		sufix = ".json";

		dropObject = {
			cid,
			sufix,
			prefix,
			hiddenURI: prefix + cid + "hidden" + sufix,
		};
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
			dropObject = {
				...dropObject,
				maxSupply: 5,
				dropName: "first drop",
			};
		});

		it("create drop", async () => {
			const tx = await drop.createDrop(dropObject);
			await printGas(tx);
			const dropId = Number(tx.value);
			const newDrop = await drop.drops(dropId);
			expect(newDrop.name).to.be.equal(dropObject.dropName);
			expect(newDrop.hash).to.be.equal(0);
			expect(newDrop.prefix).to.be.equal(prefix);
			expect(newDrop.sufix).to.be.equal(sufix);
		});

		it("event emmited", async () => {
			await expect(drop.createDrop(dropObject))
				.to.emit(drop, "CreateDrop")
				.withArgs(0, dropObject.dropName);
		});
	});
	describe("mint", () => {
		beforeEach(async () => {
			dropObject = {
				...dropObject,
				maxSuply: 5,
				dropName: "first drop",
				maxPerTx: 2,
			};
			await drop.createDrop(dropObject);
		});
		it("fail invalid mint amount", async () => {
			await expect(drop.mint(0, 3)).to.be.revertedWith("Invalid mint amount!");
		});

		it("fail Max supply exceeded!", async () => {
			await expect(drop.mint(0, 1)).to.be.revertedWith("Max supply exceeded!");
		});
		it("create offer", async () => {
			const tx = await drop.connect(userSigner).mint(0, 1);
			await printGas(tx);
			const drop = await drop.drops(0);
			expect(drop.totalNft).to.be.eq(1);
		});

		it("fail Max supply exceeded!", async () => {
			await expect(drop.mint(0, 1)).to.be.revertedWith("Max supply exceeded!");
		});
	});
	//	describe("define drop", () => {
	//		beforeEach(async () => {
	//			dropObject = {
	//				...dropObject,
	//
	//				maxSupply: 5,
	//				dropName: "first drop",
	//			};
	//			await drop.createDrop(dropObject);
	//			await drop.connect(userSigner).makeOffer(0, 11);
	//		});
	//
	//		it("fail drop does not finished", async () => {
	//			await expect(drop.connect(userSigner).defineDrop(0)).to.be.revertedWith(
	//				"Drop is not finished"
	//			);
	//		});
	//		it("fail you are not the drop owner", async () => {
	//			await expect(drop.defineDrop(0)).to.be.revertedWith(
	//				"You are not the owner"
	//			);
	//		});
	//		it("define drop", async () => {
	//			const tx = await drop.connect(userSigner).defineDrop(0, {
	//				value: ethers.utils.parseEther("0.1"),
	//			});
	//			await printGas(tx);
	//			const tokenId = tx.value;
	//			const definedDrop = await drop.drops(0);
	//			expect(maxSupply).to.be.gt(definedDrop.hash);
	//			const nft = await drop.nfts(tokenId);
	//			expect(maxSupply).to.be.gt(nft);
	//			const balanceOf = await drop.balanceOf(user);
	//			expect(balanceOf).to.be.eq(1);
	//		});
	//	});
});
