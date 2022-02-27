const CONTRACT_NAME = "TokenSale";
// const { utils } = ethers;

const TOKEN_PRICE = ethers.utils.parseUnits("1","wei");

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
