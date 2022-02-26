const { expect } = require("chai");
// const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");
// const { increaseTime } = require("../utils/transactions.js");
const { utils } = ethers;
const { parseEther } = utils;

describe("NftDrop", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());
		userSigner = await ethers.provider.getSigner(user);

		// drop = await ethers.getContractFactory("Nft");
		// drop = await Nft.deploy();

		Drop = await ethers.getContractFactory("NftDrop");
		drop = await Drop.deploy();
		nft = {};
		cid = "QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6";
		prefix = "ipfs://";
		sufix = ".json";
		hiddenURI = prefix + cid + "hidden" + sufix;
		maxMintPerTx = 2;
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
			dropName = "first drop";
		});

		it("create drop", async () => {
			const tx = await drop.createDrop(
				maxSupply,
				dropName,
				cid,
				prefix,
				sufix,
				hiddenURI,
				maxMintPerTx
			);
			await printGas(tx);
			const dropId = Number(tx.value);
			const newDrop = await drop.drops(dropId);
			expect(newDrop.name).to.be.equal(dropName);
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
					prefix,
					sufix,
					hiddenURI,
					maxMintPerTx
				)
			)
				.to.emit(drop, "CreateDrop")
				.withArgs(0, dropName);
		});
	});
	describe("mint", () => {
		beforeEach(async () => {
			maxSupply = 2;
			dropName = "first drop";
			maxMintPerTx = 3;
			await drop.createDrop(
				maxSupply,
				dropName,
				cid,
				prefix,
				sufix,
				hiddenURI,
				maxMintPerTx
			);
		});
		it("fail invalid mint amount", async () => {
			await expect(drop.mint(0, 4)).to.be.revertedWith("Invalid mint amount!");
		});

		it("fail wrong eth amoutn!", async () => {
			await expect(drop.mint(0, 1)).to.be.revertedWith("Invalid eth amount!");
		});
		it("mint", async () => {
			const tx = await drop
				.connect(userSigner)
				.mint(0, 1, { value: parseEther("0.01") });
			await printGas(tx);
      const taxRate = parseEther("0.01").sub(parseEther('0.001'));
			const newDrop = await drop.drops(0);
			expect(newDrop.totalNft).to.be.eq(1);

      const dropBalance = await drop.dropsBalance(0);

			expect(dropBalance.to.be.eq(taxRate);
			expect(await drop.balance()).to.be.eq(parseEther('0.001'));
		});

		it("fail Max supply exceeded!", async () => {
			const tx = await drop.mint(0, 2, { value: parseEther("1") });
			await printGas(tx);

			await expect(drop.mint(0, 1)).to.be.revertedWith("Max supply exceeded!");
		});
	});
	describe("define drop", () => {
		beforeEach(async () => {
			maxSupply = 5;
			dropName = "first drop";
			initialPrice = 10;
			await drop.createDrop(
				maxSupply,
				dropName,
				cid,
				prefix,
				sufix,
				hiddenURI,
				maxMintPerTx
			);
		});

		it("fail you are not the drop owner", async () => {
			await expect(drop.connect(userSigner).defineDrop(0)).to.be.revertedWith(
				"You are not the owner"
			);
		});
		it("define drop", async () => {
			const tx = await drop.defineDrop(0, {
				value: ethers.utils.parseEther("0.1"),
			});
			await printGas(tx);
			const definedDrop = await drop.drops(0);
			expect(definedDrop.revealed);
		});
	});
});
