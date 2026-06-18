import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { getNotifications } from '@/api/events';
import Navbar from '@/components/Navbar';
import NotificationToast from '@/components/NotificationToast';
import HomePage from './home';
import ProfilePage from './profile';
import EventDetailPage from './event-detail';
import LoginPage from './login';
import RegisterPage from './register';
import CreateActivityPage from './create-activity';
import NotificationsPage from './notifications';
import type { Notification } from '@/types';
import '@/index.css';

const App = () => {
  const { user, isLoggedIn, setNotifications, addNotification } = useStore();
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('eco_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        useStore.getState().login(parsedUser);
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
  }, []);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem('eco_user', JSON.stringify(user));
      
      getNotifications(user.id)
        .then((notifs) => {
          setNotifications(notifs);
          
          const unreadNotifs = notifs.filter(n => !n.read);
          if (unreadNotifs.length > 0) {
            setToastNotification(unreadNotifs[0]);
          }
        })
        .catch(console.error);
    } else {
      localStorage.removeItem('eco_user');
    }
  }, [user?.id, setNotifications]);
  
  const handleToastClose = () => {
    setToastNotification(null);
  };
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-forest-50/30 to-white">
        <Navbar />
        
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/login" element={
              isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
              isLoggedIn ? <Navigate to="/" replace /> : <RegisterPage />
            } />
            <Route path="/profile" element={
              isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />
            } />
            <Route path="/create" element={
              isLoggedIn ? <CreateActivityPage /> : <Navigate to="/login" replace />
            } />
            <Route path="/notifications" element={
              isLoggedIn ? <NotificationsPage /> : <Navigate to="/login" replace />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="bg-forest-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-forest-200 text-sm">
              绿行志愿 - 让每一份环保贡献都被看见
            </p>
            <p className="text-forest-300 text-xs mt-2">
              © 2025 绿行志愿 版权所有
            </p>
          </div>
        </footer>
        
        <NotificationToast 
          notification={toastNotification} 
          onClose={handleToastClose}
        />
      </div>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
