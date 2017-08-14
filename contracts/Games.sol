pragma solidity ^0.4.11;


contract Games {
    struct Game {
        string name;
        uint price;
        uint purchase_count;
        address owner;
    }

    mapping(uint => Game) public games;
    mapping(address => mapping (uint => uint)) payed;
    mapping(address => uint[]) payedGames;
    mapping(address => uint[]) ownerGames;
    uint[] latestGameIds;
    
    uint counter = 0;

    function getID() returns(uint) {
        return ++counter;
    }

    function addGame(string _name, uint _price) returns(uint) {
        uint id = getID();

        games[id] = Game({
            name: _name,
            price: _price,
            owner: msg.sender,
            purchase_count: 0
        });

        ownerGames[msg.sender].push(id);
        latestGameIds.push(id);

        return id;
    }

    function buyGame(uint _gameId) payable {
        if (games[_gameId].price == 0) {
            throw;
        }

        if (payed[msg.sender][_gameId] != 0) {
            throw;
        }

        if (games[_gameId].price > msg.value) {
            throw;
        }

        games[_gameId].purchase_count++;
        payed[msg.sender][_gameId] = msg.value;
        payedGames[msg.sender].push(_gameId);
    }

    function getUserPayedGameIds() public constant returns(uint[]) {
        return payedGames[msg.sender];
    }

    function getUserOwnerGameIds() public constant returns(uint[]) {
        return ownerGames[msg.sender];
    }

    function getGame(uint _gameId) public constant returns(uint, string, uint, address, uint) {
        return (_gameId, games[_gameId].name, games[_gameId].price, games[_gameId].owner, games[_gameId].purchase_count);
    }

    function getLatestGameIds() public constant returns(uint[]) {
        return latestGameIds;
    }
}
