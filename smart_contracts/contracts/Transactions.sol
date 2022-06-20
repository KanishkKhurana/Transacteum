//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Transactions{
    uint256 public transactionCounter;

    event Transfer (address from, address receiver, uint amount, string message, uint256 timestamp, string keyword);

    struct TransferStruct{
        address from;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] public transactions;

    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public{
        transactionCounter++;
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    function getAllTransactions() public view returns (TransferStruct[] memory){
        return transactions;
    }
        
    
    function getTransactionCount() public view returns (uint256){
        return transactionCounter;
    }
}