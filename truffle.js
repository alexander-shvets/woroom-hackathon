var bip39 = require("bip39");
var hdkey = require('ethereumjs-wallet/hdkey');
var HDWalletProvider = require("truffle-hdwallet-provider");

// Get our mnemonic and create an hdwallet
var mnemonic = 'pass phrase';
var hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));

// Get the first account using the standard hd path.
var wallet_hdpath = "m/44'/60'/0'/0/";
var wallet = hdwallet.derivePath(wallet_hdpath + "0").getWallet();
var address = "0x" + wallet.getAddress().toString("hex");

console.log(address);

module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        live: {
            network_id: 1
        },
        ropsten: {
            provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"),
            network_id: 3 // official id of the ropsten network
        },
        test: {
            network_id: 300,
            host: "localhost",
            port: 8545
        }
    }
};
