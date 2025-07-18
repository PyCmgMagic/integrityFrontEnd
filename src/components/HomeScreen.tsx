import React, { useState } from 'react';
import { Icon } from './Icon';
import { Avatar } from './Avatar';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryTabs = [
    { name: 'UI Design', count: 23, color: '#E8F5E8' },
    { name: 'Webflow', count: 23, color: '#FFE8E8' },
    { name: '3D Design', count: null, color: '#E8F4FF' }
  ];

  return (
    <div className="screen home-screen">
      {/* Header */}
      <div className="header-card">
        <div className="user-info">
          <div>
            <h2>Hi,Sarah</h2>
            <p className="subtitle">Basic Member</p>
          </div>
          <Avatar name="Sarah" size={40} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>Let's Learn Now!</h1>
        
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <Icon name="search" size={18} color="#6B6B6B" />
            <input
              type="text"
              placeholder="Search Course"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon name="grid" size={18} color="#6B6B6B" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categoryTabs.map((tab) => (
            <button
              key={tab.name}
              className={`tab ${activeTab === tab.name ? 'active' : ''}`}
              style={{ backgroundColor: tab.color }}
              onClick={() => setActiveTab(activeTab === tab.name ? '' : tab.name)}
            >
              {tab.name} {tab.count && <span className="count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      <div className="course-cards">
        {/* Business Analytics Card */}
        <div className="course-card yellow-card" onClick={() => onNavigate('course-detail')}>
          <div className="card-content">
            <h3>Business Analytics</h3>
            <div className="analytics-illustration">
              <div className="chart-container">
                <div className="chart-background">
                  <div className="grid-lines">
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line vertical"></div>
                    <div className="grid-line vertical"></div>
                    <div className="grid-line vertical"></div>
                  </div>
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '45px' }}></div>
                    <div className="bar" style={{ height: '60px' }}></div>
                    <div className="bar" style={{ height: '35px' }}></div>
                    <div className="bar" style={{ height: '70px' }}></div>
                  </div>
                  <div className="chart-line">
                    <svg width="120" height="80" viewBox="0 0 120 80">
                      <path d="M20,60 Q40,30 60,40 T100,20" stroke="#1A1A1A" strokeWidth="3" fill="none" />
                      <circle cx="60" cy="40" r="6" fill="#1A1A1A" />
                    </svg>
                  </div>
                  <div className="chart-person">
                    <div className="person-head"></div>
                    <div className="person-body"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="participants">
                <div className="participant-avatars">
                  <Avatar name="A" size={24} />
                  <Avatar name="B" size={24} />
                  <Avatar name="C" size={24} />
                  <span className="participant-count">+33</span>
                </div>
              </div>
              <button className="start-button">
                <Icon name="play" size={16} color="#FFFFFF" />
                Start Learning
              </button>
            </div>
          </div>
        </div>

        {/* Purple Analytics Card */}
        <div className="course-card purple-card">
          <div className="card-content">
            <h3>Business Analytics</h3>
            <div className="analytics-illustration purple">
              <div className="chart-container">
                <div className="chart-background">
                  <div className="grid-lines">
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line horizontal"></div>
                    <div className="grid-line vertical"></div>
                    <div className="grid-line vertical"></div>
                    <div className="grid-line vertical"></div>
                  </div>
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '45px' }}></div>
                    <div className="bar" style={{ height: '60px' }}></div>
                    <div className="bar" style={{ height: '35px' }}></div>
                    <div className="bar" style={{ height: '70px' }}></div>
                  </div>
                  <div className="chart-line">
                    <svg width="120" height="80" viewBox="0 0 120 80">
                      <path d="M20,60 Q40,30 60,40 T100,20" stroke="#FFFFFF" strokeWidth="3" fill="none" />
                      <circle cx="60" cy="40" r="6" fill="#FFFFFF" />
                    </svg>
                  </div>
                  <div className="chart-person">
                    <div className="person-head"></div>
                    <div className="person-body"></div>
                  </div>
                  <div className="floating-shapes">
                    <div className="shape-circle"></div>
                    <div className="shape-triangle"></div>
                    <div className="shape-square"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-bottom">
              <div className="bottom-actions">
                <button className="action-btn active">
                  <Icon name="home" size={20} color="#FFFFFF" />
                </button>
                <button className="action-btn">
                  <Icon name="refresh" size={20} color="rgba(255,255,255,0.6)" />
                </button>
                <button className="action-btn">
                  <Icon name="settings" size={20} color="rgba(255,255,255,0.6)" />
                </button>
                <button className="action-btn">
                  <Icon name="bookmark" size={20} color="rgba(255,255,255,0.6)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 