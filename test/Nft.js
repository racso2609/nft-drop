const { expect } = require("chai");
const { fixture } = deployments;
const { printGas } = require("../utils/transactions.js");
const { increaseTime, toWei } = require("../utils/transactions.js");

const TOTAL_SUPPLY = ethers.utils.parseEther("100");
const TOKEN_PRICE = ethers.utils.parseUnits("1","wei");

describe("NftDrop", () => {
	beforeEach(async () => {
		({ deployer, user, userNotRegister } = await getNamedAccounts());
		userSigner = await ethers.provider.getSigner(user);

		userNotRegisterSigner = await ethers.provider.getSigner(userNotRegister);
		duration = 60 * 10;
		await fixture(["Token", "TokenSale", "Drop"]);

		tokenInstance = await ethers.getContract("Token");
		tokenSaleInstance = await ethers.getContract("TokenSale");
		drop = await ethers.getContract("Drop");

		cid = "QmUt9nNKwbdA1UKFfiqkfQnHhTQ3Gx69NveB3eCZhmnzR6";
		mintPrice = TOKEN_PRICE;
		await tokenInstance.transfer(tokenSaleInstance.address, TOTAL_SUPPLY);
	});
	describe("mint on the drop", () => {
		beforeEach(async () => {
			racAmount = ethers.utils.parseEther("1");
			valueOfEth = racAmount.mul(TOKEN_PRICE);

			await tokenSaleInstance.buyTokens(racAmount, { value: valueOfEth });
			await tokenSaleInstance
				.connect(userSigner)
				.buyTokens(racAmount, { value: valueOfEth });

			await tokenInstance.increaseAllowance(drop.address, racAmount);
			await tokenInstance
				.connect(userSigner)
				.increaseAllowance(drop.address, racAmount);
		});

		it("fail trying  mint invalid mint ammount", async () => {
			await expect(
				drop.connect(userNotRegisterSigner).mint(6)
			).to.be.revertedWith("Invalid mint amount!");
		});
		it("fail trying  mint Insufficient founds", async () => {
			await tokenInstance.decreaseAllowance(drop.address, racAmount);

			await expect(drop.mint(1)).to.be.revertedWith(
				"ERC20: insufficient allowance"
			);
		});
		it("fail trying  mint, you are not a minter and does not start the public mint", async () => {
			await expect(drop.connect(userSigner).mint(1)).to.be.revertedWith(
				"Mint does not start!"
			);
		});
		it("mint like a minter", async () => {
			const tx = await drop.mint(1);
			await printGas(tx);
			const totalNft = await drop.totalNft();
			expect(totalNft).to.be.eq(1);
		});
		it("mint without be a minter", async () => {
			increaseTime(duration + 60);
			const tx = await drop.connect(userSigner).mint(1);
			await printGas(tx);
			const totalNft = await drop.totalNft();
			expect(totalNft).to.be.eq(1);
		});

		it("fail trying  mint max supply exceeded", async () => {
			await tokenSaleInstance.buyTokens(mintPrice.mul(5), {
				value: mintPrice.mul(5).mul(TOKEN_PRICE),
			});
			await tokenInstance.increaseAllowance(
				drop.address,
				mintPrice.mul(5).mul(TOKEN_PRICE)
			);

			const tx = await drop.mint(5);
			await printGas(tx);
			await expect(drop.mint(1)).to.be.revertedWith("Max supply exceeded!");
		});
		it("fail trying  drop finished", async () => {
			increaseTime(duration*2);

			await expect(drop.mint(1)).to.be.revertedWith("This drop is finished!");
		});
	});
	describe("defineDrop", () => {
		it("fail, define drop when not finished", async () => {
			await expect(drop.defineDrop()).to.be.revertedWith(
				"This drop is not finished!"
			);
		});

		it("fail, define drop when you are nor the owner", async () => {
			increaseTime(duration*2);

			await expect(drop.connect(userSigner).defineDrop()).to.be.revertedWith(
				"Ownable: caller is not the owner"
			);
		});
		it("defineDrop succesfully", async () => {
			increaseTime(duration*2);


			const tx = await drop.defineDrop();
			await printGas(tx);
			const isDefined = await drop.revealed();
			expect(isDefined);
		});
	});
});
