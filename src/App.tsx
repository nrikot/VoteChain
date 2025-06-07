import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import { ElectionProvider } from './context/ElectionContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import VotePage from './pages/VotePage';
import ResultsPage from './pages/ResultsPage';
import AllResults from './pages/AllResults';
import Settings from './pages/Settings';

function App() {
  return (
    <WalletProvider>
      <ElectionProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            <Header />
            <div className="flex">
              <Navigation />
              <main className="flex-1 ml-64 p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/create" element={<CreateElection />} />
                    <Route path="/vote/:electionId" element={<VotePage />} />
                    <Route path="/results/:electionId" element={<ResultsPage />} />
                    <Route path="/results" element={<AllResults />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </div>
        </Router>
      </ElectionProvider>
    </WalletProvider>
  );
}

export default App;