import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { OrdersPage } from '../pages/OrdersPage';
import { ConfigureDashboardPage } from '../pages/ConfigureDashboardPage';
import { PrivateRoute } from '../components/PrivateRoute';
import { PublicRoute } from '../components/PublicRoute';
import { useAuth } from '../context/AuthContext';

const DashboardRouter = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <DashboardPage /> : <UserDashboardPage />;
};

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardRouter />,
          },
          {
            path: '/orders',
            element: <OrdersPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PrivateRoute adminOnly />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/configure',
            element: <ConfigureDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
