export interface Election {
  id: string;
  name: string;
  description: string;
  candidates: Candidate[];
  startTime: Date;
  endTime: Date;
  totalVotes: number;
  status: 'upcoming' | 'active' | 'ended';
  isWhitelisted: boolean;
  creator: string;
}

export interface Candidate {
  id: number;
  name: string;
  description: string;
  voteCount: number;
}

export interface Vote {
  electionId: string;
  candidateId: number;
  voter: string;
  timestamp: Date;
  transactionHash: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
}

export interface User {
  address: string;
  isAdmin: boolean;
  votedElections: string[];
}