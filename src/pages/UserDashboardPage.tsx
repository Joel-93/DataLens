import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { api, Order } from '../services/api';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await api.getOrders();
        // Filter orders by the current user's email
        setOrders(allOrders.filter(order => order.email === user?.email));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      processing: orders.filter((o) => o.status === 'Processing').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
    };
  }, [orders]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      title: 'Processing',
      value: stats.processing,
      icon: <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, {user?.name}! Here's a summary of your orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Orders</h2>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Order ID</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Product</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Total</th>
                  <th className="pb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-3 text-sm text-slate-900 dark:text-white font-medium">{order.id}</td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-sm text-slate-900 dark:text-white">{order.product}</td>
                    <td className="py-3 text-sm text-slate-900 dark:text-white font-medium">
                      ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' : 
                          order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300' : 
                          'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
