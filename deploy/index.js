const { utils } = ethers;
const { parseEther } = utils;
const TOKEN_PRICE = parseEther("0.001"); // 0,001 in wei
const TOTAL_SUPPLY = parseEther("20");

async function main() {
	const [deployer] = await ethers.getSigners();

	console.log("Deploying contracts with the account:", deployer.address);

	console.log("Account balance:", (await deployer.getBalance()).toString());

	// const Token = await ethers.getContractFactory("Token");
	// const token = await Token.deploy(TOTAL_SUPPLY);
	// console.log("Token address:", token.address);
	// const TokenSale = await ethers.getContractFactory("TokenSale");
	// const tokenSale = await TokenSale.deploy(token.address, TOKEN_PRICE);
	// console.log("Token Sale address:", tokenSale.address);
	const Drop = await ethers.getContractFactory("Drop");
  //0xb052bcD57453606937d70706a9C9f0bee9da64a8
	const drop = await Drop.deploy("0xb052bcD57453606937d70706a9C9f0bee9da64a8", 60 * 20, 10);

	console.log("Drop address:", drop.address);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
