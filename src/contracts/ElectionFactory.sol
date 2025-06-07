// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Election.sol";

/**
 * @title ElectionFactory
 * @dev Factory contract for creating new elections
 */
contract ElectionFactory {
    address[] public elections;
    mapping(address => address[]) public userElections;
    
    event ElectionCreated(
        address electionAddress,
        string name,
        address creator,
        uint256 startTime,
        uint256 endTime
    );
    
    /**
     * @dev Creates a new election contract
     * @param _name Election name
     * @param _description Election description
     * @param _candidateNames Array of candidate names
     * @param _candidateDescriptions Array of candidate descriptions
     * @param _startTime Election start timestamp
     * @param _endTime Election end timestamp
     * @param _isWhitelisted Whether voting is restricted to whitelisted addresses
     */
    function createElection(
        string memory _name,
        string memory _description,
        string[] memory _candidateNames,
        string[] memory _candidateDescriptions,
        uint256 _startTime,
        uint256 _endTime,
        bool _isWhitelisted
    ) external returns (address) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_candidateNames.length > 1, "Must have at least 2 candidates");
        require(
            _candidateNames.length == _candidateDescriptions.length,
            "Candidate names and descriptions length mismatch"
        );
        
        Election newElection = new Election(
            _name,
            _description,
            _candidateNames,
            _candidateDescriptions,
            _startTime,
            _endTime,
            _isWhitelisted,
            msg.sender
        );
        
        address electionAddress = address(newElection);
        elections.push(electionAddress);
        userElections[msg.sender].push(electionAddress);
        
        emit ElectionCreated(
            electionAddress,
            _name,
            msg.sender,
            _startTime,
            _endTime
        );
        
        return electionAddress;
    }
    
    /**
     * @dev Returns all election addresses
     */
    function getAllElections() external view returns (address[] memory) {
        return elections;
    }
    
    /**
     * @dev Returns elections created by a specific user
     */
    function getUserElections(address user) external view returns (address[] memory) {
        return userElections[user];
    }
    
    /**
     * @dev Returns the total number of elections
     */
    function getElectionCount() external view returns (uint256) {
        return elections.length;
    }
}