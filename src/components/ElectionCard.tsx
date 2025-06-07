import React from 'react';
import { Election } from '../types';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ElectionCardProps {
  election: Election;
  onVote?: (electionId: string) => void;
  onViewResults?: (electionId: string) => void;
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election, onVote, onViewResults }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeText = () => {
    const now = new Date();
    if (election.status === 'upcoming') {
      return `Starts ${formatDistanceToNow(election.startTime, { addSuffix: true })}`;
    } else if (election.status === 'active') {
      return `Ends ${formatDistanceToNow(election.endTime, { addSuffix: true })}`;
    } else {
      return `Ended ${formatDistanceToNow(election.endTime, { addSuffix: true })}`;
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{election.name}</h3>
          <p className="text-gray-600 text-sm">{election.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(election.status)}`}>
          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{election.candidates.length} candidates</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4" />
          <span>{election.totalVotes} total votes</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{getTimeText()}</span>
        </div>
        {election.isWhitelisted && (
          <div className="flex items-center space-x-2 text-sm text-orange-600">
            <Calendar className="w-4 h-4" />
            <span>Restricted voting</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        {election.status === 'active' && onVote && (
          <button
            onClick={() => onVote(election.id)}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium"
          >
            Vote Now
          </button>
        )}
        {onViewResults && (
          <button
            onClick={() => onViewResults(election.id)}
            className="flex-1 bg-white/30 hover:bg-white/40 text-gray-700 py-2 px-4 rounded-lg transition-all duration-200 font-medium border border-white/40"
          >
            View Results
          </button>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;