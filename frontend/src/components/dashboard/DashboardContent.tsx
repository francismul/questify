'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatCard } from './StatCard';
import {
  Globe,
  Clock,
  MapPin,
  ChevronDown,
  Download,
} from 'lucide-react';

export const DashboardContent: React.FC = () => {
  // Sample data - replace with real data from your API
  const stats = [
    {
      title: 'Online Now',
      value: '6',
      subtitle: 'Active users',
      color: 'red' as const,
      percentage: 25,
    },
    {
      title: 'Online Today',
      value: '10',
      subtitle: 'Total today',
      color: 'green' as const,
      percentage: 42,
    },
    {
      title: 'Online All Total',
      value: '2236',
      subtitle: 'Total visitors',
      color: 'blue' as const,
      percentage: 89,
    },
    {
      title: 'Returning Visitors',
      value: '12%',
      subtitle: 'Return rate',
      color: 'purple' as const,
      percentage: 12,
    },
    {
      title: 'Average Age',
      value: '25',
      subtitle: 'Years of age',
      color: 'yellow' as const,
      percentage: 60,
    },
    {
      title: 'Mobile Users',
      value: '98%',
      subtitle: 'Mobile traffic',
      color: 'cyan' as const,
      percentage: 98,
    },
  ];

  const topCountries = [
    { name: 'English', percentage: 54.4 },
    { name: 'Urdu', percentage: 79 },
  ];

  const topLanguages = [
    { name: 'English', percentage: 54.4 },
    { name: 'Urdu', percentage: 79 },
  ];

  const recentVisitors = [
    {
      id: 1,
      photo: '/api/placeholder/40/40',
      action: 'Fb Login',
      location: 'Handy MM Alam Road-2',
      user: 'Umsan Ashraf Bajwah',
      time: 'September 19, 2017',
    },
    {
      id: 2,
      photo: '/api/placeholder/40/40',
      action: 'Fb Login',
      location: 'Handy MM Alam Road-2',
      user: 'Umsan Ashraf Bajwah',
      time: 'September 19, 2017',
    },
    {
      id: 3,
      photo: '/api/placeholder/40/40',
      action: 'Fb Login',
      location: 'Handy MM Alam Road-2',
      user: 'Umsan Ashraf Bajwah',
      time: 'September 19, 2017',
    },
    {
      id: 4,
      photo: '/api/placeholder/40/40',
      action: 'Fb Login',
      location: 'Handy MM Alam Road-2',
      user: 'Umsan Ashraf Bajwah',
      time: 'September 19, 2017',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Yellow Header Bar */}
      <div className="bg-yellow-400 text-slate-900 px-6 py-4 rounded-lg font-semibold">
        <h2 className="text-lg">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top Countries List
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>Name</div>
              <div className="text-right">Percentage</div>
            </div>
            {topCountries.map((country) => (
              <div
                key={country.name}
                className="grid grid-cols-2 gap-4 items-center py-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {country.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 dark:text-white font-medium">
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Language List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Top Language List
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>Name</div>
              <div className="text-right">Percentage</div>
            </div>
            {topLanguages.map((language) => (
              <div
                key={language.name}
                className="grid grid-cols-2 gap-4 items-center py-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {language.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-900 dark:text-white font-medium">
                    {language.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Last Visitors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Last Visitors
            </h3>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Photos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Action Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentVisitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      U
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900 dark:text-white">
                      {visitor.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {visitor.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900 dark:text-white">
                      {visitor.user}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {visitor.time}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
