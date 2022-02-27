const CONTRACT_NAME = "TokenSale";
const { utils } = ethers;
const { parseEther } = utils;
const TOKEN_PRICE = parseEther("0.001"); // 0,001 in wei
const TOKEN_ADDRESS = "";

// modify when needed
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
	const Token = await deployments.get("Token");

	// Upgradeable Proxy
	await deploy(CONTRACT_NAME, {
		from: deployer,
		log: true,
		args: [Token.address, TOKEN_PRICE],
	});
};

module.exports.tags = [CONTRACT_NAME];
module.exports.dependencies = ["Token"];
