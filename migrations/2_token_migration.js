const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "NFT Game", "NFTG", "");
  let tokenInstance = await Token.deployed();
  // await tokenInstance.mint(100, 200, 2000); //Token id 0
  // await tokenInstance.mint(150, 150, 3000); //Token id 1
  let pet = await tokenInstance.getTokenDetails(1);
  console.log(pet);
};
