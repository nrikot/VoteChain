import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Vote, Wallet, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">VoteChain</h1>
              <p className="text-xs text-gray-600">Decentralized Voting Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-700" />
                    <span className="text-sm font-medium text-gray-800">
                      {formatAddress(wallet.address!)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Balance: {parseFloat(wallet.balance).toFixed(4)} ETH
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-700 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 border border-red-300/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;