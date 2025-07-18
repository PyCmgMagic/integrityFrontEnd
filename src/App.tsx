import React, { useState } from 'react';
import './App.css';
import { 
  Icon, 
  Avatar,
  LoginScreen, 
  HomeScreen, 
  CourseDetailScreen, 
  DashboardScreen 
} from './components';

// Main App Component
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  return (
    <div className="app">
      <div className="phone-container">
        {currentScreen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
        {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
        {currentScreen === 'course-detail' && <CourseDetailScreen onNavigate={handleNavigate} />}
        {currentScreen === 'dashboard' && <DashboardScreen onNavigate={handleNavigate} />}
      </div>
      
      {/* Navigation Tabs - Only show when not on login screen */}
      {currentScreen !== 'login' && (
        <div className="bottom-nav">
          <button 
            className={currentScreen === 'home' ? 'active' : ''}
            onClick={() => handleNavigate('home')}
          >
            <Icon name="home" size={24} />
          </button>
          <button 
            className={currentScreen === 'course-detail' ? 'active' : ''}
            onClick={() => handleNavigate('course-detail')}
          >
            <Icon name="book" size={24} />
          </button>
          <button 
            className={currentScreen === 'dashboard' ? 'active' : ''}
            onClick={() => handleNavigate('dashboard')}
          >
            <Icon name="grid" size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
