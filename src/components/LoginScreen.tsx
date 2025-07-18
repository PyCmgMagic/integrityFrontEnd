import React, { useState } from 'react';
import { Icon } from './Icon';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Simple validation - in real app, this would connect to backend
    if (email && password) {
      onNavigate('home');
    }
  };

  return (
    <div className="screen login-screen">
      {/* Logo/Brand Section */}
      <div className="login-header">
        <div className="brand-logo">
          <div className="logo-circle">
            <Icon name="book" size={32} color="#FFFFFF" />
          </div>
        </div>
        <h1>Welcome Back!</h1>
        <p className="login-subtitle">Sign in to continue your learning journey</p>
      </div>

      {/* Login Form */}
      <div className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? 'eye_off' : 'eye'} size={20} color="#6B6B6B" />
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkmark"></span>
            Remember me
          </label>
          <button className="forgot-password">Forgot Password?</button>
        </div>

        <button className="login-button" onClick={handleLogin}>
          <span>Sign In</span>
          <Icon name="arrow_right" size={20} color="#FFFFFF" />
        </button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-btn google">
            <div className="social-icon google-icon">G</div>
            Google
          </button>
          <button className="social-btn apple">
            <div className="social-icon apple-icon">
              <Icon name="apple" size={18} color="#FFFFFF" />
            </div>
            Apple
          </button>
        </div>

        <div className="signup-prompt">
          <span>Don't have an account? </span>
          <button className="signup-link">Sign Up</button>
        </div>
      </div>
    </div>
  );
}; 