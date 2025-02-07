// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

contract Savings {

    address payable public owner;
    mapping(address => uint256) public AmountSaved;
    uint256 public totalSavings;
    uint256 public unlockTime;

    event Save(address indexed sender, uint256 amount);
    event Withdrawn(uint256 amount);

    constructor(uint256 _unlockTime) {
        require(block.timestamp < _unlockTime, "Unlock time must be in the future");
        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier timeUnlocked() {
        require(block.timestamp >= unlockTime, "Wait Some More");
        _;
    }

    // Track ETH sent to the contract directly
    receive() external payable {
        require(msg.value > 0, "You can't send nothing");

        // Track the amount sent by the sender
        AmountSaved[msg.sender] += msg.value;
        totalSavings += msg.value;

        emit Save(msg.sender, msg.value);
    }

  
    function save() public payable onlyOwner {
        require(msg.value > 0, "You can't save nothing");
        AmountSaved[msg.sender] += msg.value;
        totalSavings += msg.value;
        emit Save(msg.sender , msg.value);
    }

    function withdraw(uint256 _amount) public onlyOwner timeUnlocked {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= totalSavings, "Insufficient balance");
        
        totalSavings -= _amount;
        AmountSaved[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdrawn(_amount);
    }
    // Get the total balance of the contract
    function getBalance() public view returns (uint256) {
        return totalSavings;
    }
}
