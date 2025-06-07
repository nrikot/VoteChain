import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import ElectionCard from '../components/ElectionCard';
import { BarChart3 } from 'lucide-react';

const AllResults: React.FC = () => {
  const navigate = useNavigate();
  const { elections } = useElection();

  const handleViewResults = (electionId: string) => {
    navigate(`/results/${electionId}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Election Results</h1>
        <p className="text-gray-600">View results from all elections</p>
      </div>

      {elections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map(election => (
            <ElectionCard
              key={election.id}
              election={election}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Elections Available</h3>
          <p className="text-gray-500 mb-6">There are no elections to show results for.</p>
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

export default AllResults;