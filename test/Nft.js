const { expect } = require("chai");
// const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");
const { increaseTime } = require("../utils/transactions.js");
const { BigNumber } = ethers;

const TOTAL_SUPPLY = BigNumber.from("1000000000000000");

describe("NftDrop", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());
		userSigner = await ethers.provider.getSigner(user);

		duration = 60 * 10;
		// drop = await ethers.getContractFactory("Nft");
		// drop = await Nft.deploy();
		Token = await ethers.getContractFactory("Token");
		tokenInstance = await Token.deploy(TOTAL_SUPPLY);

		Drop = await ethers.getContractFactory("Drop");
		drop = await Drop.deploy(tokenInstance.address, duration, 60);
		cid = "QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6";
		fee = ethers.utils.parseEther("0.1");
	});
	describe("mint on the drop", () => {
		it("fail trying  mint invalid mint ammount", async () => {
			await expect(drop.mint(6)).to.be.revertedWith("Invalid mint amount!");
		});
		it("fail trying  mint Insufficient founds", async () => {
			await expect(drop.mint(1)).to.be.revertedWith("Insufficient funds!");
		});
		it("fail trying  mint, you are not a minter and does not start the public mint", async () => {
			await expect(drop.connect(userSigner).mint(1)).to.be.revertedWith(
				"Mint does not start!"
			);
		});
		it("mint like a minter", async () => {
			const tx = await drop.mint(1, { value: fee });
			await printGas(tx);
			const totalNft = await drop.totalNft();
			expect(totalNft).to.be.eq(1);
		});
		it("mint without be a minter", async () => {
			increaseTime(60);
			const tx = await drop.connect(userSigner).mint(1, { value: fee });
			await printGas(tx);
			const totalNft = await drop.totalNft();
			expect(totalNft).to.be.eq(1);
		});

		it("fail trying  mint max supply exceeded", async () => {
			const tx = await drop.mint(5, { value: ethers.utils.parseEther("0.6") });
			await printGas(tx);
			await expect(drop.mint(1)).to.be.revertedWith("Max supply exceeded!");
		});
		it("fail trying  drop finished", async () => {
			increaseTime(duration+60);

			await expect(drop.mint(1, { value: fee })).to.be.revertedWith(
				"This drop is finished!"
			);
		});
	});
	describe("defineDrop", () => {
		

		it("fail, define drop when not finished", async () => {
			await expect(drop.defineDrop()).to.be.revertedWith(
				"This drop is not finished!"
			);
		});

		it("fail, define drop when you are nor the owner", async () => {
			increaseTime(duration + 60);

			await expect(drop.connect(userSigner).defineDrop()).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		it("defineDrop succesfully", async () => {
			increaseTime(duration + 60);

			const tx = await drop.defineDrop();
			await printGas(tx);
			const isDefined = await drop.revealed();
			expect(isDefined);
		});
	});
});
