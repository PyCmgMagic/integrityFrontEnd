import React from 'react';
import { Icon } from './Icon';

interface CourseDetailScreenProps {
  onNavigate: (screen: string) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({ onNavigate }) => {
  const ongoingItems = [
    {
      title: "Customer journey map",
      subtitle: "Sarah Wilson",
      lessons: "8 Lessons",
      progress: "35% Complete",
      color: "#4CAF50"
    },
    {
      title: "Customer journey map",
      subtitle: "Sarah Wilson", 
      lessons: "8 Lessons",
      progress: "35% Complete",
      color: "#4CAF50"
    }
  ];

  return (
    <div className="screen course-detail-screen">
      {/* Navigation */}
      <div className="navigation">
        <button className="nav-btn" onClick={() => onNavigate('home')}>
          <Icon name="arrow_left" size={20} />
        </button>
        <button className="nav-btn">
          <Icon name="more_horizontal" size={20} />
        </button>
      </div>

      {/* Course Hero */}
      <div className="course-hero">
        <h1>From Basics to Breakthroughs</h1>
        <div className="breakthrough-illustration">
          <div className="illustration-container">
            <div className="magnifying-glass">
              <div className="glass-circle">
                <div className="glass-inner">
                  <div className="mountain-peaks">
                    <svg width="40" height="25" viewBox="0 0 40 25">
                      <path d="M5,20 L15,8 L25,15 L35,5" stroke="#8B7EDB" strokeWidth="2" fill="none" />
                      <polygon points="5,20 15,8 25,15 35,5 35,20" fill="rgba(139,126,219,0.3)" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="glass-handle"></div>
            </div>
            <div className="background-charts">
              <div className="chart-bars-bg">
                <div className="bar-bg" style={{ height: '30px' }}></div>
                <div className="bar-bg" style={{ height: '20px' }}></div>
                <div className="bar-bg" style={{ height: '25px' }}></div>
              </div>
              <div className="floating-elements">
                <div className="floating-circle"></div>
                <div className="floating-square"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="course-stats">
          <div className="stat">
            <Icon name="clock" size={16} color="#FFFFFF" />
            <span>2 hours 16 mins</span>
          </div>
          <div className="stat">
            <Icon name="book" size={16} color="#FFFFFF" />
            <span>17 Lessons</span>
          </div>
        </div>
      </div>

      {/* Ongoing Section */}
      <div className="section">
        <div className="section-header">
          <h2>Ongoing</h2>
          <button className="see-all-btn">See all</button>
        </div>
        <div className="ongoing-items">
          {ongoingItems.map((item, index) => (
            <div key={index} className="ongoing-item">
              <div className="item-icon">
                <div className="journey-icon" style={{ backgroundColor: index === 0 ? '#4CAF50' : '#8B7EDB' }}>
                  <Icon name="bookmark" size={16} color="#FFFFFF" />
                </div>
              </div>
              <div className="item-content">
                <h3>{item.title}</h3>
                <p className="subtitle">{item.subtitle}</p>
                <div className="item-meta">
                  <span className="lessons">{item.lessons}</span>
                  <span className="progress" style={{ color: item.color }}>{item.progress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 