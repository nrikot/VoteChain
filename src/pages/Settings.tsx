import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Settings as SettingsIcon, Wallet, Globe, Shield, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const { wallet } = useWallet();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your voting platform preferences</p>
      </div>

      {/* Wallet Information */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <div className="flex items-center space-x-2 mb-6">
          <Wallet className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Wallet Information</h2>
        </div>
        
        {wallet.isConnected ? (
          <div className="space-y-4">
            <div className="bg-white/30 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-gray-800 font-mono text-sm break-all">{wallet.address}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                <p className="text-gray-800 font-semibold">{parseFloat(wallet.balance).toFixed(4)} ETH</p>
              </div>
              
              <div className="bg-white/30 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <p className="text-gray-800 font-semibold">
                  {wallet.chainId === 80001 ? 'Polygon Mumbai' : 
                   wallet.chainId === 137 ? 'Polygon Mainnet' : 
                   `Chain ID: ${wallet.chainId}`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No wallet connected</p>
          </div>
        )}
      </div>

      {/* Network Settings */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <div className="flex items-center space-x-2 mb-6">
          <Globe className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Network Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/30 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Supported Networks</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Polygon Mumbai Testnet</span>
                <span className="text-green-600 text-sm">✓ Supported</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Polygon Mainnet</span>
                <span className="text-green-600 text-sm">✓ Supported</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/30 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Privacy & Security Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Votes are immutably recorded on blockchain</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Voter addresses are anonymized in public displays</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Smart contracts prevent double voting</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Time-locked elections ensure fairness</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
        <div className="flex items-center space-x-2 mb-6">
          <Bell className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Election Reminders</h3>
              <p className="text-sm text-gray-600">Get notified about upcoming elections</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Result Notifications</h3>
              <p className="text-sm text-gray-600">Get notified when election results are available</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;