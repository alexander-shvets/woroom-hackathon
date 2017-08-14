pragma solidity ^0.4.11;


import "./zeppelin/token/StandardToken.sol";


/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract WoroomToken is StandardToken {

  string public name = "WoroomToken";
  string public symbol = "WRT";
  uint public decimals = 8;
  uint public INITIAL_SUPPLY = 100000000000000;

  /**
   * @dev Contructor that gives msg.sender all of existing tokens.
   */
  function WoroomToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}
