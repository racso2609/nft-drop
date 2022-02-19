const { utils } = require("ethers");
const { parseEther } = utils;

const initialSupply = BigNumber.from("1000000000000000");
const tokenPrice = parseEther("0.001"); // 0,001 in wei

async function main() {
  // We get the contract to deploy
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(initialSupply);

  const TokenSale = await ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(token.address, tokenPrice);

  console.log("Token deployed to:", token.address);
  console.log("TokenSale deployed to:", tokenSale.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
