import React, { useState } from 'react';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simple validation
    if (username && password) {
      onNavigate('home');
    }
  };

  return (
    <div className="login-screen-container">
      <div className="login-background" />
      <div className="login-content">
        <div className="login-logo-container">
          <div className="login-logo">
            <span className="logo-text">N</span>
            <div className="logo-waves">
              <div className="wave" />
              <div className="wave" />
              <div className="wave" />
            </div>
          </div>
        </div>

        <div className="login-form-container">
          <div className="login-input-wrapper">
            <UserOutlined className="login-input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>
          <div className="login-input-wrapper">
            <LockOutlined className="login-input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
          </div>
          <button className="login-submit-button" onClick={handleLogin}>
            Get Started
          </button>
        </div>

        <div className="login-footer">
          <button className="login-footer-link">Create Account</button>
          <button className="login-footer-link">Need Help?</button>
        </div>
      </div>
    </div>
  );
}; 