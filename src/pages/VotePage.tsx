import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import { useWallet } from '../context/WalletContext';
import { Vote } from '../types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VotePage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { getElectionById, addVote } = useElection();
  const { wallet } = useWallet();
  
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const election = electionId ? getElectionById(electionId) : null;

  if (!election) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Found</h2>
        <p className="text-gray-600 mb-6">The election you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (election.status !== 'active') {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Election Not Active</h2>
        <p className="text-gray-600 mb-6">
          This election is currently {election.status}.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!wallet.isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-6">Please connect your wallet to participate in voting.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleVote = async () => {
    if (selectedCandidate === null) {
      toast.error('Please select a candidate');
      return;
    }

    setIsVoting(true);
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const vote: Vote = {
        electionId: election.id,
        candidateId: selectedCandidate,
        voter: wallet.address!,
        timestamp: new Date(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

      addVote(vote);
      setHasVoted(true);
      toast.success('Vote cast successfully!');
    } catch (error) {
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Vote Cast Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for participating in "{election.name}". Your vote has been recorded on the blockchain.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(`/results/${election.id}`)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-white/30 hover:bg-white/40 text-gray-700 px-6 py-3 rounded-lg transition-all duration-200 border border-white/40"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.name}</h1>
        <p className="text-gray-600">{election.description}</p>
      </div>

      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Select Your Candidate</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {election.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedCandidate === candidate.id
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-white/40 bg-white/20 hover:bg-white/30'
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{candidate.name}</h3>
                  {candidate.description && (
                    <p className="text-gray-600 text-sm">{candidate.description}</p>
                  )}
                </div>
                {selectedCandidate === candidate.id && (
                  <CheckCircle className="w-6 h-6 text-purple-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/30 hover:bg-white/40 text-gray-700 rounded-lg transition-all duration-200 font-medium border border-white/40"
          >
            Cancel
          </button>
          
          <button
            onClick={handleVote}
            disabled={selectedCandidate === null || isVoting}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedCandidate === null || isVoting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isVoting ? 'Casting Vote...' : 'Cast Your Vote'}
          </button>
        </div>
      </div>

      {selectedCandidate !== null && (
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Important Notice</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Once you cast your vote, it cannot be changed. Please make sure you've selected the correct candidate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotePage;