var WoroomToken = artifacts.require("./WoroomToken.sol");

module.exports = function(deployer) {
  deployer.deploy(WoroomToken);
};
