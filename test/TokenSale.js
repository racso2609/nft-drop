const { expect } = require("chai");
const { fixture } = deployments;
const { utils, BigNumber } = ethers;
const { parseEther } = utils;

const TOTAL_SUPPLY = utils.parseEther("100");
const TOKEN_PRICE = ethers.utils.parseUnits("1", "wei");
const TOKENS_AVALIABLE = 750_000;

describe("Token Sale", () => {
	beforeEach(async () => {
		await fixture(["Token", "TokenSale"]);
		tokenInstance = await ethers.getContract("Token");

		tokenSaleInstance = await ethers.getContract("TokenSale");
		[admin, buyer] = await ethers.getSigners();
	});
	describe("Deploy", () => {
		it("initialize contract", async () => {
			expect(await tokenSaleInstance.tokenContract()).to.be.properAddress;
			expect(await tokenSaleInstance.tokenPrice()).to.equal(TOKEN_PRICE);
		});
	});
	describe("Token buying", () => {
		beforeEach(async () => {
			// Provision 75% of all tokens to the token sale
			await tokenInstance
				.connect(admin)
				.transfer(tokenSaleInstance.address, TOKENS_AVALIABLE);
		});
		it("fail buy token msg value with wrong amount", async () => {
			await expect(
				tokenSaleInstance.connect(buyer).buyTokens(10, {
					value: 1,
				})
			).to.be.revertedWith("wrong eth amount");
		});
		// ------------------ FALLOOOOO ---------------
		it("fail purchase more tokens than avaliable", async () => {
			const tokenAmount = TOKENS_AVALIABLE + 1;
			await expect(
				tokenSaleInstance.connect(buyer).buyTokens(tokenAmount, {
					value: TOKEN_PRICE.mul(tokenAmount), 
				})
			).to.be.revertedWith("cannot purchase more tokens than avaliable");
		});
		// ------- :( ------------------------
		it("purchase tokens", async () => {
			const tokenAmount = 1;
			await tokenSaleInstance.connect(buyer).buyTokens(tokenAmount, {
				value: TOKEN_PRICE.mul(tokenAmount),
			});
			expect(await tokenInstance.balanceOf(buyer.address)).to.equal(
				tokenAmount
			);
		});
	});
	describe("End sale", () => {
		it("end sale fail you are not a admin", async () => {
			await expect(tokenSaleInstance.connect(buyer).endSale()).to.be.reverted;
		});
		it("end sale admin go well", async () => {
			await tokenSaleInstance.connect(admin).endSale();
			expect(await tokenInstance.balanceOf(admin.address)).to.equal(
				TOTAL_SUPPLY
			);
		});
	});
});
