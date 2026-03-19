import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Settings, BarChart2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      adminOnly: false,
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: <ShoppingCart size={20} />,
      adminOnly: false,
    },
    {
      name: 'Configure Dashboard',
      path: '/configure',
      icon: <Settings size={20} />,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <BarChart2 size={24} className="stroke-[2.5]" />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">DataLens</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-200'
                )
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
