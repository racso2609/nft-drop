const CONTRACT_NAME = "TokenSale";
const { utils } = ethers;
const { parseEther } = utils;
const TOKEN_PRICE = parseEther("0.001"); // 0,001 in wei

// modify when needed
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	// Upgradeable Proxy
	await deploy(CONTRACT_NAME, {
		from: deployer,
		log: true,
		execute: {
			init: {
				methodName: "constructor",
				args: [TOKEN_PRICE],
			},
		},
	});
};

module.exports.tags = [CONTRACT_NAME];
