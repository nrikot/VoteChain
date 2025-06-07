// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Election
 * @dev Smart contract for conducting decentralized elections
 */
contract Election is Ownable, ReentrancyGuard {
    struct Candidate {
        string name;
        string description;
        uint256 voteCount;
    }
    
    struct VoteInfo {
        uint256 candidateId;
        uint256 timestamp;
        bool hasVoted;
    }
    
    string public name;
    string public description;
    uint256 public startTime;
    uint256 public endTime;
    bool public isWhitelisted;
    bool public isFinalized;
    
    Candidate[] public candidates;
    mapping(address => VoteInfo) public voters;
    mapping(address => bool) public whitelist;
    
    uint256 public totalVotes;
    
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
    event VoterWhitelisted(address indexed voter);
    event ElectionFinalized(uint256 totalVotes, uint256 winningCandidateId);
    
    modifier onlyDuringVoting() {
        require(block.timestamp >= startTime, "Election has not started");
        require(block.timestamp <= endTime, "Election has ended");
        require(!isFinalized, "Election is finalized");
        _;
    }
    
    modifier onlyAfterVoting() {
        require(block.timestamp > endTime || isFinalized, "Election is still ongoing");
        _;
    }
    
    modifier onlyWhitelisted() {
        if (isWhitelisted) {
            require(whitelist[msg.sender], "Address not whitelisted");
        }
        _;
    }
    
    /**
     * @dev Constructor to initialize the election
     */
    constructor(
        string memory _name,
        string memory _description,
        string[] memory _candidateNames,
        string[] memory _candidateDescriptions,
        uint256 _startTime,
        uint256 _endTime,
        bool _isWhitelisted,
        address _owner
    ) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_candidateNames.length > 1, "Must have at least 2 candidates");
        
        name = _name;
        description = _description;
        startTime = _startTime;
        endTime = _endTime;
        isWhitelisted = _isWhitelisted;
        
        // Initialize candidates
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                description: _candidateDescriptions[i],
                voteCount: 0
            }));
        }
        
        _transferOwnership(_owner);
    }
    
    /**
     * @dev Cast a vote for a candidate
     * @param candidateId The ID of the candidate to vote for
     */
    function vote(uint256 candidateId) 
        external 
        onlyDuringVoting 
        onlyWhitelisted 
        nonReentrant 
    {
        require(candidateId < candidates.length, "Invalid candidate ID");
        require(!voters[msg.sender].hasVoted, "Already voted");
        
        voters[msg.sender] = VoteInfo({
            candidateId: candidateId,
            timestamp: block.timestamp,
            hasVoted: true
        });
        
        candidates[candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(msg.sender, candidateId, block.timestamp);
    }
    
    /**
     * @dev Add addresses to the whitelist (only owner)
     * @param addresses Array of addresses to whitelist
     */
    function addToWhitelist(address[] memory addresses) external onlyOwner {
        require(isWhitelisted, "Election is not whitelisted");
        
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
            emit VoterWhitelisted(addresses[i]);
        }
    }
    
    /**
     * @dev Remove an address from the whitelist (only owner)
     * @param voter Address to remove from whitelist
     */
    function removeFromWhitelist(address voter) external onlyOwner {
        require(isWhitelisted, "Election is not whitelisted");
        whitelist[voter] = false;
    }
    
    /**
     * @dev Finalize the election (only owner, only after voting period)
     */
    function finalizeElection() external onlyOwner onlyAfterVoting {
        require(!isFinalized, "Election already finalized");
        
        isFinalized = true;
        
        uint256 winningCandidateId = getWinningCandidate();
        emit ElectionFinalized(totalVotes, winningCandidateId);
    }
    
    /**
     * @dev Get election results
     */
    function getResults() external view onlyAfterVoting returns (
        string[] memory candidateNames,
        string[] memory candidateDescriptions,
        uint256[] memory voteCounts
    ) {
        candidateNames = new string[](candidates.length);
        candidateDescriptions = new string[](candidates.length);
        voteCounts = new uint256[](candidates.length);
        
        for (uint256 i = 0; i < candidates.length; i++) {
            candidateNames[i] = candidates[i].name;
            candidateDescriptions[i] = candidates[i].description;
            voteCounts[i] = candidates[i].voteCount;
        }
    }
    
    /**
     * @dev Get the winning candidate ID
     */
    function getWinningCandidate() public view returns (uint256) {
        uint256 winningVoteCount = 0;
        uint256 winningCandidateId = 0;
        
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }
        
        return winningCandidateId;
    }
    
    /**
     * @dev Get candidate information
     */
    function getCandidate(uint256 candidateId) external view returns (
        string memory candidateName,
        string memory candidateDescription,
        uint256 voteCount
    ) {
        require(candidateId < candidates.length, "Invalid candidate ID");
        
        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.description, candidate.voteCount);
    }
    
    /**
     * @dev Get total number of candidates
     */
    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }
    
    /**
     * @dev Check if an address has voted
     */
    function hasVoted(address voter) external view returns (bool) {
        return voters[voter].hasVoted;
    }
    
    /**
     * @dev Get voter information (only after voting or for own vote)
     */
    function getVoterInfo(address voter) external view returns (
        uint256 candidateId,
        uint256 timestamp,
        bool hasVotedFlag
    ) {
        require(
            msg.sender == voter || block.timestamp > endTime || isFinalized,
            "Cannot view other votes during election"
        );
        
        VoteInfo memory voteInfo = voters[voter];
        return (voteInfo.candidateId, voteInfo.timestamp, voteInfo.hasVoted);
    }
    
    /**
     * @dev Check if address is whitelisted
     */
    function isAddressWhitelisted(address addr) external view returns (bool) {
        if (!isWhitelisted) return true;
        return whitelist[addr];
    }
    
    /**
     * @dev Get election status
     */
    function getElectionStatus() external view returns (string memory) {
        if (block.timestamp < startTime) {
            return "upcoming";
        } else if (block.timestamp <= endTime && !isFinalized) {
            return "active";
        } else {
            return "ended";
        }
    }
}