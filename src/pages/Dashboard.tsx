import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import { useWallet } from '../context/WalletContext';
import ElectionCard from '../components/ElectionCard';
import { TrendingUp, Users, Vote, Calendar } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { elections } = useElection();
  const { wallet } = useWallet();

  const activeElections = elections.filter(e => e.status === 'active');
  const upcomingElections = elections.filter(e => e.status === 'upcoming');
  const totalVotes = elections.reduce((sum, e) => sum + e.totalVotes, 0);

  const stats = [
    {
      label: 'Active Elections',
      value: activeElections.length,
      icon: Vote,
      color: 'from-green-400 to-green-600',
    },
    {
      label: 'Total Votes Cast',
      value: totalVotes,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
    },
    {
      label: 'Upcoming Elections',
      value: upcomingElections.length,
      icon: Calendar,
      color: 'from-purple-400 to-purple-600',
    },
    {
      label: 'Total Elections',
      value: elections.length,
      icon: Users,
      color: 'from-pink-400 to-pink-600',
    },
  ];

  const handleVote = (electionId: string) => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }
    navigate(`/vote/${electionId}`);
  };

  const handleViewResults = (electionId: string) => {
    navigate(`/results/${electionId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the decentralized voting platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Elections */}
      {activeElections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map(election => (
              <ElectionCard
                key={election.id}
                election={election}
                onVote={handleVote}
                onViewResults={handleViewResults}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingElections.map(election => (
              <ElectionCard
                key={election.id}
                election={election}
                onViewResults={handleViewResults}
              />
            ))}
          </div>
        </section>
      )}

      {elections.length === 0 && (
        <div className="text-center py-12">
          <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Elections Available</h3>
          <p className="text-gray-500 mb-6">There are no elections to display at the moment.</p>
          <button
            onClick={() => navigate('/create')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            Create New Election
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;