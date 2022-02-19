const CONTRACT_NAME = "NftDrop";
const NFT_ADDRESS = '';

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
					args: [NFT_ADDRESS],
				},
			},
		},
	});
};

module.exports.tags = [CONTRACT_NAME];
