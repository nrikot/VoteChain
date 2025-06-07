import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import { useWallet } from '../context/WalletContext';
import { Election, Candidate } from '../types';
import { Plus, Trash2, Calendar, Users, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateElection: React.FC = () => {
  const navigate = useNavigate();
  const { addElection } = useElection();
  const { wallet } = useWallet();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    isWhitelisted: false,
  });
  
  const [candidates, setCandidates] = useState<Omit<Candidate, 'voteCount'>[]>([
    { id: 0, name: '', description: '' },
    { id: 1, name: '', description: '' },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCandidateChange = (index: number, field: 'name' | 'description', value: string) => {
    setCandidates(prev => prev.map((candidate, i) => 
      i === index ? { ...candidate, [field]: value } : candidate
    ));
  };

  const addCandidate = () => {
    setCandidates(prev => [
      ...prev,
      { id: prev.length, name: '', description: '' }
    ]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.isConnected) {
      toast.error('Please connect your wallet to create an election');
      return;
    }

    if (!formData.name || !formData.description || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (candidates.some(c => !c.name)) {
      toast.error('Please provide names for all candidates');
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    const now = new Date();
    const status = startTime > now ? 'upcoming' : (endTime > now ? 'active' : 'ended');

    const newElection: Election = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      candidates: candidates.map(candidate => ({
        ...candidate,
        voteCount: 0,
      })),
      startTime,
      endTime,
      totalVotes: 0,
      status,
      isWhitelisted: formData.isWhitelisted,
      creator: wallet.address!,
    };

    addElection(newElection);
    toast.success('Election created successfully!');
    navigate('/');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Election</h1>
        <p className="text-gray-600">Set up a new decentralized voting election</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-2 mb-6">
            <Settings className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Election Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                placeholder="e.g., Student Council Election 2024"
                required
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isWhitelisted"
                checked={formData.isWhitelisted}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 bg-white/50 border-gray-300 rounded focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Restrict voting to registered addresses
              </label>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              placeholder="Describe the purpose and details of this election..."
              required
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">Time Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Candidates</h2>
            </div>
            <button
              type="button"
              onClick={addCandidate}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="bg-white/30 rounded-lg p-4 border border-white/40">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Candidate {index + 1}</h3>
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeCandidate(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm"
                      placeholder="Candidate name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={candidate.description}
                      onChange={(e) => handleCandidateChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm"
                      placeholder="Brief description or title"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/30 hover:bg-white/40 text-gray-700 rounded-lg transition-all duration-200 font-medium border border-white/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Create Election
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;