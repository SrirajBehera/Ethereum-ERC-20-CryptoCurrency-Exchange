pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap{
    string public name = "EthSwap Instant Exchange"; // name is a state variable which means it is recognised by the blockchain
    Token public token;
    uint public rate = 100;

    event TokensPurchased( // like a subscription that tells everyone something happened
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    // whenever constructor is added, make sure the arguments are passed in all different places required
    constructor(Token _token) public { // _token is a local variable
        token = _token; // to make it recognisable by the blockchain, this is done
    }

    function buyTokens() public payable {
        // Redemption rate = # of tokens they receive for 1 ether
        // Amount of Ethereum * Redemption Rate
        // Calculate number of tokens to buy
        uint tokenAmount = msg.value * rate; // msg.value will tell how many ethers were given

        // Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount); // will execute the below codes if this condition passes otherwise it will throw an error

        // Transfer token to the user
        token.transfer(msg.sender, tokenAmount); // msg.sender will tell who did the transaction

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // Calculate the amount of Ether to redeem
        uint etherAmount = _amount / rate;

        require(address(this).balance >= etherAmount);

        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount); // this function allows smart contract spends your token for you
        msg.sender.transfer(etherAmount); // this transfer function is different from ERC-20 token transfer function

        // Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}