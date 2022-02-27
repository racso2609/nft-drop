const CONTRACT_NAME = "Drop";
const TimeOfDurationOnSecond = 10 * 60; //10 min
const TimeToStartOnSecond = 10 * 60; //10 min
// modify when needed
module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
	const Token = await deployments.get("Token");

	// Upgradeable Proxy
	await deploy(CONTRACT_NAME, {
		from: deployer,
		log: true,
		args: [Token.address, TimeOfDurationOnSecond, TimeToStartOnSecond],
	});
};

module.exports.tags = [CONTRACT_NAME];
module.exports.dependencies = ["Token"];
