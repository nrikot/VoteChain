import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Election, Vote } from '../types';

interface ElectionContextType {
  elections: Election[];
  votes: Vote[];
  addElection: (election: Election) => void;
  updateElection: (electionId: string, updates: Partial<Election>) => void;
  addVote: (vote: Vote) => void;
  getElectionById: (id: string) => Election | undefined;
}

const ElectionContext = createContext<ElectionContextType | null>(null);

interface ElectionProviderProps {
  children: ReactNode;
}

export const ElectionProvider: React.FC<ElectionProviderProps> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>([
    {
      id: '1',
      name: 'Student Council President 2024',
      description: 'Annual election for Student Council President position',
      candidates: [
        { id: 0, name: 'Alice Johnson', description: 'Junior, Computer Science', voteCount: 45 },
        { id: 1, name: 'Bob Smith', description: 'Senior, Business Administration', voteCount: 32 },
        { id: 2, name: 'Carol Davis', description: 'Junior, Political Science', voteCount: 23 },
      ],
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-20T17:00:00'),
      totalVotes: 100,
      status: 'active',
      isWhitelisted: false,
      creator: '0x1234567890abcdef1234567890abcdef12345678',
    },
    {
      id: '2',
      name: 'Community Project Funding',
      description: 'Vote on which community project should receive funding',
      candidates: [
        { id: 0, name: 'Community Garden', description: 'Establish a local community garden', voteCount: 78 },
        { id: 1, name: 'Youth Sports Center', description: 'Build a new sports facility for youth', voteCount: 56 },
        { id: 2, name: 'Senior Center Renovation', description: 'Renovate the existing senior center', voteCount: 44 },
      ],
      startTime: new Date('2024-01-10T08:00:00'),
      endTime: new Date('2024-01-25T20:00:00'),
      totalVotes: 178,
      status: 'active',
      isWhitelisted: true,
      creator: '0x9876543210fedcba9876543210fedcba98765432',
    },
  ]);
  
  const [votes, setVotes] = useState<Vote[]>([]);

  const addElection = (election: Election) => {
    setElections(prev => [...prev, election]);
  };

  const updateElection = (electionId: string, updates: Partial<Election>) => {
    setElections(prev => 
      prev.map(election => 
        election.id === electionId ? { ...election, ...updates } : election
      )
    );
  };

  const addVote = (vote: Vote) => {
    setVotes(prev => [...prev, vote]);
    
    // Update vote counts
    setElections(prev =>
      prev.map(election => {
        if (election.id === vote.electionId) {
          const updatedCandidates = election.candidates.map(candidate =>
            candidate.id === vote.candidateId
              ? { ...candidate, voteCount: candidate.voteCount + 1 }
              : candidate
          );
          return {
            ...election,
            candidates: updatedCandidates,
            totalVotes: election.totalVotes + 1,
          };
        }
        return election;
      })
    );
  };

  const getElectionById = (id: string) => {
    return elections.find(election => election.id === id);
  };

  return (
    <ElectionContext.Provider
      value={{
        elections,
        votes,
        addElection,
        updateElection,
        addVote,
        getElectionById,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = () => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};