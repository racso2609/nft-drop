const CONTRACT_NAME = "Token";
const { utils } = ethers;
const { parseEther } = utils;
const TOTAL_SUPPLY = BigNumber.from("1000000000000000");

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
					args: [TOTAL_SUPPLY],
				},
			},
		},
	});
};

module.exports.tags = [CONTRACT_NAME];
