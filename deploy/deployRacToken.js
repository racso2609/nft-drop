const CONTRACT_NAME = "Token";
const { BigNumber } = ethers;
const INITIAL_SUPPLY = BigNumber.from("1000000000000000");

// modify when needed
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	// Upgradeable Proxy
	await deploy(CONTRACT_NAME, {
		from: deployer,
		log: true,
		proxy: {
			execute: {
				init: {
					methodName: "constructor",
					args: [INITIAL_SUPPLY],
				},
			},
		},
	});
};

module.exports.tags = [CONTRACT_NAME];
