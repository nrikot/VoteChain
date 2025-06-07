import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import toast from 'react-hot-toast';

// Contract ABIs (simplified for demo)
const ELECTION_FACTORY_ABI = [
  "function createElection(string memory _name, string memory _description, string[] memory _candidateNames, string[] memory _candidateDescriptions, uint256 _startTime, uint256 _endTime, bool _isWhitelisted) external returns (address)",
  "function getAllElections() external view returns (address[] memory)",
  "function getUserElections(address user) external view returns (address[] memory)",
  "event ElectionCreated(address electionAddress, string name, address creator, uint256 startTime, uint256 endTime)"
];

const ELECTION_ABI = [
  "function vote(uint256 candidateId) external",
  "function getResults() external view returns (string[] memory, string[] memory, uint256[] memory)",
  "function hasVoted(address voter) external view returns (bool)",
  "function getCandidate(uint256 candidateId) external view returns (string memory, string memory, uint256)",
  "function getCandidateCount() external view returns (uint256)",
  "function getElectionStatus() external view returns (string memory)",
  "function totalVotes() external view returns (uint256)",
  "event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp)"
];

// Mock contract addresses (would be real addresses in production)
const FACTORY_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

export const useBlockchain = () => {
  const { provider, signer, wallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const createElection = useCallback(async (
    name: string,
    description: string,
    candidateNames: string[],
    candidateDescriptions: string[],
    startTime: Date,
    endTime: Date,
    isWhitelisted: boolean
  ) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const factory = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, ELECTION_FACTORY_ABI, signer);
      
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);

      const tx = await factory.createElection(
        name,
        description,
        candidateNames,
        candidateDescriptions,
        startTimestamp,
        endTimestamp,
        isWhitelisted
      );

      const receipt = await tx.wait();
      
      // Parse the ElectionCreated event to get the new election address
      const event = receipt.events?.find((e: any) => e.event === 'ElectionCreated');
      const electionAddress = event?.args?.electionAddress;

      toast.success('Election created successfully!');
      return electionAddress;
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const castVote = useCallback(async (electionAddress: string, candidateId: number) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const election = new ethers.Contract(electionAddress, ELECTION_ABI, signer);
      
      const tx = await election.vote(candidateId);
      await tx.wait();

      toast.success('Vote cast successfully!');
      return tx.hash;
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [signer]);

  const getElectionResults = useCallback(async (electionAddress: string) => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    try {
      const election = new ethers.Contract(electionAddress, ELECTION_ABI, provider);
      
      const [candidateNames, candidateDescriptions, voteCounts] = await election.getResults();
      const totalVotes = await election.totalVotes();

      return {
        candidates: candidateNames.map((name: string, index: number) => ({
          id: index,
          name,
          description: candidateDescriptions[index],
          voteCount: Number(voteCounts[index])
        })),
        totalVotes: Number(totalVotes)
      };
    } catch (error) {
      console.error('Error getting election results:', error);
      throw error;
    }
  }, [provider]);

  const hasUserVoted = useCallback(async (electionAddress: string) => {
    if (!provider || !wallet.address) {
      return false;
    }

    try {
      const election = new ethers.Contract(electionAddress, ELECTION_ABI, provider);
      return await election.hasVoted(wallet.address);
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }, [provider, wallet.address]);

  const getAllElections = useCallback(async () => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    try {
      const factory = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, ELECTION_FACTORY_ABI, provider);
      const electionAddresses = await factory.getAllElections();
      
      // In a real implementation, you would fetch details for each election
      return electionAddresses;
    } catch (error) {
      console.error('Error getting elections:', error);
      throw error;
    }
  }, [provider]);

  return {
    createElection,
    castVote,
    getElectionResults,
    hasUserVoted,
    getAllElections,
    loading
  };
};