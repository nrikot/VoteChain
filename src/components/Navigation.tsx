import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/create', icon: Plus, label: 'Create Election' },
    { to: '/results', icon: BarChart3, label: 'Results' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-r border-white/20 w-64 h-screen fixed left-0 top-16 z-40">
      <div className="p-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 border border-purple-300/50'
                    : 'text-gray-700 hover:bg-white/20 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;