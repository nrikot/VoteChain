import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import VoteChart from '../components/VoteChart';
import { ArrowLeft, Trophy, Users, BarChart3 } from 'lucide-react';

const ResultsPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { getElectionById } = useElection();

  const election = electionId ? getElectionById(electionId) : null;

  if (!election) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Election not found</div>
      </div>
    );
  }

  const sortedCandidates = [...election.candidates].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sortedCandidates[0];
  const totalVotes = election.totalVotes;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{election.name}</h1>
          <p className="text-gray-600">Election Results</p>
        </div>
      </div>

      {/* Winner Announcement */}
      {election.status === 'ended' && winner && winner.voteCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-300/50 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800">Winner</h2>
          </div>
          <div className="bg-white/30 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800">{winner.name}</h3>
            {winner.description && (
              <p className="text-gray-600 mt-1">{winner.description}</p>
            )}
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                {winner.voteCount} votes
              </span>
              <span className="text-gray-600">
                {totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}% of total votes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalVotes}</p>
              <p className="text-gray-600 text-sm">Total Votes</p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{election.candidates.length}</p>
              <p className="text-gray-600 text-sm">Candidates</p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {totalVotes > 0 ? ((winner?.voteCount || 0) / totalVotes * 100).toFixed(1) : 0}%
              </p>
              <p className="text-gray-600 text-sm">Winning Margin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VoteChart 
          candidates={election.candidates} 
          type="bar" 
          title="Vote Distribution (Bar Chart)"
        />
        <VoteChart 
          candidates={election.candidates} 
          type="doughnut" 
          title="Vote Distribution (Pie Chart)"
        />
      </div>

      {/* Detailed Results */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Detailed Results</h3>
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="flex items-center justify-between p-4 bg-white/30 rounded-lg border border-white/40"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                  {candidate.description && (
                    <p className="text-gray-600 text-sm">{candidate.description}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">{candidate.voteCount}</div>
                <div className="text-sm text-gray-600">
                  {totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {election.status === 'active' && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> This election is still active. Results will continue to update as votes are cast.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;