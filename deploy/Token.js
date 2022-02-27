const CONTRACT_NAME = "Token";
const { utils } = ethers;
const TOTAL_SUPPLY = utils.parseEther('100');

// modify when needed
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	// Upgradeable Proxy
	await deploy(CONTRACT_NAME, {
		from: deployer,
		log: true,
		args: [TOTAL_SUPPLY],
	});
};

module.exports.tags = [CONTRACT_NAME];
