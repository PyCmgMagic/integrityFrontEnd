import React, { useState } from 'react';
import { Icon } from './Icon';
import { Avatar } from './Avatar';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(28);
  
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dates = [24, 25, 26, 27, 28, 29, 30];

  const progressItems = [
    {
      title: "Customer journey map",
      subtitle: "Progress",
      progress: "52%",
      color: "linear-gradient(135deg, #A594F0 0%, #8B7EDB 100%)",
      showPercentage: true
    },
    {
      title: "Customer",
      subtitle: "Progress",
      progress: "",
      color: "linear-gradient(135deg, #87CEEB 0%, #4FC3F7 100%)",
      showPercentage: false
    }
  ];

  return (
    <div className="screen dashboard-screen">
      {/* Navigation */}
      <div className="navigation transparent">
        <button className="nav-btn transparent" onClick={() => onNavigate('home')}>
          <Icon name="arrow_left" size={20} color="#FFFFFF" />
        </button>
        <button className="nav-btn transparent">
          <Icon name="more_horizontal" size={20} color="#FFFFFF" />
        </button>
      </div>

      {/* Calendar Widget */}
      <div className="calendar-widget">
        <div className="calendar-header">
          <button className="nav-btn">
            <Icon name="chevron_left" size={20} />
          </button>
          <h2>October 2025</h2>
          <button className="nav-btn">
            <Icon name="chevron_right" size={20} />
          </button>
        </div>
        <div className="calendar-grid">
          <div className="week-days">
            {weekDays.map(day => (
              <div key={day} className="week-day">{day}</div>
            ))}
          </div>
          <div className="calendar-dates">
            {dates.map(date => (
              <button
                key={date}
                className={`calendar-date ${date === currentDate ? 'active' : ''}`}
                onClick={() => setCurrentDate(date)}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="section">
        <div className="section-header">
          <h2>Your Progress</h2>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="progress-cards">
          {progressItems.map((item, index) => (
            <div key={index} className="progress-card" style={{ background: item.color }}>
              <div className="card-content">
                <Icon name="bookmark" size={20} color="#FFFFFF" />
                <h3>{item.title}</h3>
                <div className="progress-info">
                  <span className="progress-text">{item.subtitle}</span>
                  {item.showPercentage && (
                    <span className="progress-value">{item.progress}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses Section */}
      <div className="section">
        <div className="section-header">
          <h2>Courses</h2>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="course-card yellow-card mini" onClick={() => onNavigate('course-detail')}>
          <div className="card-content">
            <h3>Business Analytics</h3>
            <div className="analytics-illustration mini">
              <div className="chart-container">
                <div className="chart-background">
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '25px' }}></div>
                    <div className="bar" style={{ height: '35px' }}></div>
                    <div className="bar" style={{ height: '20px' }}></div>
                    <div className="bar" style={{ height: '40px' }}></div>
                  </div>
                  <div className="chart-line">
                    <svg width="80" height="50" viewBox="0 0 80 50">
                      <path d="M15,35 Q30,20 45,25 T70,15" stroke="#1A1A1A" strokeWidth="2" fill="none" />
                      <circle cx="45" cy="25" r="3" fill="#1A1A1A" />
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
                  <Avatar name="A" size={20} />
                  <Avatar name="B" size={20} />
                  <Avatar name="C" size={20} />
                  <span className="participant-count">+33</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 