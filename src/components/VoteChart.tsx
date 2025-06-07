import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Candidate } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface VoteChartProps {
  candidates: Candidate[];
  type?: 'bar' | 'doughnut';
  title?: string;
}

const VoteChart: React.FC<VoteChartProps> = ({ candidates, type = 'bar', title }) => {
  const colors = [
    'rgba(139, 92, 246, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
  ];

  const borderColors = [
    'rgba(139, 92, 246, 1)',
    'rgba(6, 182, 212, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(239, 68, 68, 1)',
  ];

  const data = {
    labels: candidates.map(candidate => candidate.name),
    datasets: [
      {
        label: 'Votes',
        data: candidates.map(candidate => candidate.voteCount),
        backgroundColor: colors.slice(0, candidates.length),
        borderColor: borderColors.slice(0, candidates.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
      {type === 'bar' ? (
        <Bar data={data} options={options} />
      ) : (
        <Doughnut data={data} options={options} />
      )}
    </div>
  );
};

export default VoteChart;