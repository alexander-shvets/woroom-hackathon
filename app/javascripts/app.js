// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import woroomtoken_artifacts from '../../dest/contracts/WoroomToken.json'
import games_artifacts from '../../dest/contracts/Games.json'

// WoroomToken is our usable abstraction, which we'll use through the code below.
var WoroomToken = contract(woroomtoken_artifacts);
var Games = contract(games_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var GamesContract;
var WoroomContract;

var ladda = require('ladda');
window.ladda = ladda;

window.App = {
  games: {},

  start: function() {
    var self = this;

    // Bootstrap the WoroomToken abstraction for Use.
    WoroomToken.setProvider(web3.currentProvider);
    Games.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      Promise.all([Games.deployed(), WoroomToken.deployed()]).then(function(value, value2){
        GamesContract = value[0];
        WoroomContract = value[1];

        window.GamesContract = GamesContract;

        //self.refreshBalance();
        self.renderMyGames();
        self.renderPayedGames();
        self.renderLatestGames();
      });
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;
    WoroomContract.balanceOf(account, {from: account}).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    WoroomContract.transfer(receiver, amount, {from: account}).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  createGame: function() {
    var self = this;
    var price = parseInt(document.getElementById("price").value) * 1000000000000000;
    var name = document.getElementById("name").value;

    var spinner = ladda.create(document.getElementById('add_game'));
    spinner.start();
    GamesContract.addGame(name, price, {from: account}).then(function() {
      self.renderMyGames();
      self.renderLatestGames();
      spinner.stop();
    }).catch(function(e) {
      spiiner.stop();
      console.log(e);
      self.setStatus("Error adding game; see log.");
    });
  },

  renderMyGames: function() {
    var self = this;
    GamesContract.getUserOwnerGameIds(name, price, {from: account}).then(function(value) {
      return self.getGames(value);
    }).then(function(games){
      var parts = [];
      for (var i in games) {
        parts.push(self.formatGame(games[i]));
      }
      document.getElementById('my_games').innerHTML = parts.join("<br/>");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error adding game; see log.");
    });
  },

  renderLatestGames: function() {
    var self = this;
    GamesContract.getLatestGameIds().then(function(value) {
      return self.getGames(value);
    }).then(function(games){
      var parts = [];
      for (var i in games) {
        parts.push(self.formatGame(games[i]));
      }

      document.getElementById('latest_games').innerHTML = parts.join("<br/>");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error adding game; see log.");
    });
  },

  renderPayedGames: function() {
    var self = this;
    GamesContract.getUserPayedGameIds(name, price, {from: account}).then(function(value) {
      return self.getGames(value);
    }).then(function(games){
      var parts = [];
      for (var i in games) {
        parts.push(self.formatGame(games[i]));
      }

      document.getElementById('payed_games').innerHTML = parts.join("<br/>");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error adding game; see log.");
    });
  },

  arrayToGame: function(gameArray) {
    return {
      'id': gameArray[0],
      'name': gameArray[1],
      'price': gameArray[2],
      'priceFinney': gameArray[2] / 1000000000000000,
      'owner': gameArray[3],
      'purchase_count': gameArray[4],
    };
  },

  formatGame: function(game) {
    return "<div class='game'>" +
           "ID: " + game.id.toString() +
           ", Name: " + game.name +
           ", price - " + game.priceFinney.toString() + " finney" + "<br/>" +
           "buy count - " + game.purchase_count.toString() +
           " <button id='buy_"+ game.id + "' data-size='s' class='ladda-button' data-style='expand-right' onclick='App.buyGame(" + game.id + ")'><span class='ladda-label'>Buy</span></button>" +
           "</div>";
  },

  getGames: function(ids) {
    var self = this;
    var result = {};

    var promise = new Promise((resolve, reject) => {
      var gamePromises = [];

      for (var i in ids) {
        var id = ids[i];
        if (self.games[id]) {
          result[id] = self.games[id];
        } else {
          gamePromises.push(GamesContract.getGame(id));
        }
      }

      if (gamePromises.length) {
        Promise.all(gamePromises).then(function(values) {
          for (var i in values) {
            var value = values[i];
            var game = self.arrayToGame(value);
            self.games[game.id] = game;
            result[game.id] = game;
          }
          resolve(result);
        }).catch(function(e) {
          console.log(e);
          reject(e);
        });
      } else {
        resolve(result);
      }
    });

    return promise;
  },

  buyGame: function(gameid) {
    var self = this;

    var spinner = ladda.create(document.getElementById('buy_' + gameid.toString()));
    spinner.start();
    GamesContract.getGame(gameid).then(function(value){
      var game = self.arrayToGame(value);
      return GamesContract.buyGame(gameid, {from: account, value: game.price});
    }).then(function() {
      spinner.stop();
      self.reloadGame(gameid);
    }).catch(function(e) {
      spinner.stop();
      console.log(e);
      self.setStatus("Error adding game; see log.");
    });
  },

  reloadGame: function(gameid) {
    var self = this;
    GamesContract.getGame(gameid).then(function(gameArray){
      var game = self.arrayToGame(gameArray);
      self.games[game.id] = game;

      self.renderLatestGames();
      self.renderMyGames();
      self.renderPayedGames();
    })
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 WoroomToken, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
